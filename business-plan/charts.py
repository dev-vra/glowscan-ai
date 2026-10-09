"""Gráficos do plano na paleta Viço (PNG 200 dpi em charts/)."""
import json
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

import model

TERRA, SOL, INK, MUTED, LINE, CREME = "#B8462F", "#F2B66D", "#2A1B14", "#6E5C51", "#EADFD6", "#FFFBF8"
os.makedirs("charts", exist_ok=True)
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "axes.edgecolor": LINE, "axes.labelcolor": MUTED,
                     "xtick.color": MUTED, "ytick.color": MUTED, "axes.spines.top": False, "axes.spines.right": False,
                     "figure.facecolor": "white", "axes.facecolor": "white"})
mi = FuncFormatter(lambda v, _: f"R$ {v / 1e6:.1f} mi".replace(".", ",").replace(",0 ", " "))
k = FuncFormatter(lambda v, _: f"{v / 1e3:,.0f} mil".replace(",", "."))
YEARS = ["Ano 1", "Ano 2", "Ano 3", "Ano 4", "Ano 5"]

rows = model.run()
ys = model.yearly(rows)
data = json.load(open("data.json", encoding="utf-8"))


def save(fig, name):
    fig.tight_layout()
    fig.savefig(f"charts/{name}.png", dpi=200)
    plt.close(fig)


# 1. Receita por ano (assinaturas + B2B)
fig, ax = plt.subplots(figsize=(8, 4.2))
subs = [y["gross_subs"] for y in ys]
b2b = [y["b2b"] for y in ys]
ax.bar(YEARS, subs, color=TERRA, label="Assinaturas", width=0.6)
ax.bar(YEARS, b2b, bottom=subs, color=SOL, label="B2B (afiliados, estudos, painel)", width=0.6)
for i, y in enumerate(ys):
    ax.text(i, y["gross"] * 1.02, f"R$ {y['gross'] / 1e6:.1f} mi".replace(".", ","), ha="center", color=INK, fontweight="bold")
ax.yaxis.set_major_formatter(mi)
ax.legend(frameon=False, loc="upper left")
ax.set_title("Receita bruta por ano — cenário base", loc="left", color=INK, fontweight="bold")
save(fig, "receita")

# 2. Assinantes ativos (mensal)
fig, ax = plt.subplots(figsize=(8, 4.2))
ax.plot([r["m"] for r in rows], [r["subs"] for r in rows], color=TERRA, lw=3)
ax.fill_between([r["m"] for r in rows], [r["subs"] for r in rows], color=TERRA, alpha=0.08)
ax.yaxis.set_major_formatter(k)
ax.set_xlabel("Mês")
ax.set_title("Assinantes ativos — cenário base", loc="left", color=INK, fontweight="bold")
save(fig, "assinantes")

# 3. EBITDA mensal e caixa acumulado
fig, ax = plt.subplots(figsize=(8, 4.2))
ms = [r["m"] for r in rows]
ax.bar(ms, [r["ebitda"] for r in rows], color=[TERRA if r["ebitda"] < 0 else "#1F6B45" for r in rows], width=0.8, label="EBITDA mensal")
ax.plot(ms, [r["cash"] for r in rows], color=INK, lw=2.5, label="Caixa acumulado (sem aporte)")
ax.axhline(0, color=MUTED, lw=0.8)
low = min(rows, key=lambda r: r["cash"])
ax.annotate(f"Vale: R$ {low['cash'] / 1e3:,.0f} mil (mês {low['m']})".replace(",", "."), xy=(low["m"], low["cash"]),
            xytext=(low["m"] + 3, 3.5e6), arrowprops=dict(arrowstyle="->", color=MUTED), color=INK)
ax.yaxis.set_major_formatter(mi)
ax.set_xlabel("Mês")
ax.legend(frameon=False, loc="upper left")
ax.set_title("EBITDA e caixa — cenário base", loc="left", color=INK, fontweight="bold")
save(fig, "caixa")

# 4. Cenários — receita ano 5 e necessidade de caixa
fig, axes = plt.subplots(1, 2, figsize=(8, 3.6))
names = list(data["scenarios"])
colors = [MUTED, TERRA, SOL]
axes[0].bar(names, [data["scenarios"][n]["gross5"] for n in names], color=colors)
axes[0].yaxis.set_major_formatter(mi)
axes[0].set_title("Receita no ano 5", color=INK, fontweight="bold")
axes[1].bar(names, [data["scenarios"][n]["need"] for n in names], color=colors)
axes[1].yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"R$ {v / 1e6:.1f} mi".replace(".", ",")))
axes[1].set_title("Necessidade de caixa", color=INK, fontweight="bold")
save(fig, "cenarios")

# 5. Funil de aquisição (base, ano 1, por mês)
fig, ax = plt.subplots(figsize=(8, 3.2))
r1 = rows[0]
stages = [("Instalações", r1["installs"]), ("Testes grátis", r1["installs"] * model.P["install_to_trial"]), ("Assinantes", r1["new_subs"])]
ax.barh([s[0] for s in stages][::-1], [s[1] for s in stages][::-1], color=[TERRA, "#D98A2B", SOL])
for i, (_, v) in enumerate(stages[::-1]):
    ax.text(v * 1.01, i, f"{v:,.0f}".replace(",", "."), va="center", color=INK, fontweight="bold")
ax.set_title("Funil mensal no ano 1 (pago + orgânico)", loc="left", color=INK, fontweight="bold")
ax.xaxis.set_visible(False)
save(fig, "funil")
print("charts ok", os.listdir("charts"))
