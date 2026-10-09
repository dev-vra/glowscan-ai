"""Gera modelo-financeiro-vico.xlsx com fórmulas vivas (premissas → mensal → anual) e scenarios.json."""
import copy
import json

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter as L

import model

TERRA, INK, MUTED = "B8462F", "2A1B14", "6E5C51"
H = Font(bold=True, color="FFFFFF")
B = Font(bold=True, color=INK)
INPUT = PatternFill("solid", fgColor="FBEDD6")  # sol-soft = célula editável
HEAD = PatternFill("solid", fgColor=TERRA)
BAND = PatternFill("solid", fgColor="F6EEE7")
BRL = 'R$ #,##0;[Red]-R$ #,##0'
BRL2 = "R$ #,##0.00"
PCT = "0.0%"
NUM = "#,##0"


def header(ws, row, ncols):
    for c in range(1, ncols + 1):
        ws.cell(row, c).font, ws.cell(row, c).fill = H, HEAD


wb = Workbook()

# ---------- Premissas ----------
ws = wb.active
ws.title = "Premissas"
ws["A1"] = "viço — Modelo financeiro (cenário base)"
ws["A1"].font = Font(size=18, bold=True, color=TERRA)
ws["A2"] = "Células em amarelo são premissas editáveis. Todo o resto é fórmula."
ws["A2"].font = Font(italic=True, color=MUTED)
scal = [
    ("price_month", "Preço plano mensal (R$)", model.P["price_month"], BRL2, "Stripe vico_monthly"),
    ("price_year", "Preço plano anual (R$)", model.P["price_year"], BRL2, "Stripe vico_yearly"),
    ("mix_annual", "Mix de novos assinantes no anual", model.P["mix_annual"], PCT, "Hipótese; anual pré-selecionado no paywall"),
    ("store_fee", "Taxa de loja/gateway (média)", model.P["store_fee"], PCT, "Mix web (Stripe ~4%) e lojas (15% Small Business)"),
    ("tax", "Impostos sobre receita", model.P["tax"], PCT, "Simples Nacional — validar com contador"),
    ("install_to_trial", "Instalação → teste grátis", model.P["install_to_trial"], PCT, "Hipótese; calibrar no beta"),
    ("trial_to_paid", "Teste → pagante", model.P["trial_to_paid"], PCT, "RevenueCat 2025: mediana Saúde & Fitness 39,9%"),
    ("churn_monthly", "Churn mensal (plano mensal)", model.P["churn_monthly"], PCT, "Hipótese conservadora para app de consumo"),
    ("renew_annual", "Renovação do plano anual", model.P["renew_annual"], PCT, "RevenueCat: planos anuais baratos retêm até 36%"),
    ("ai_cost_per_sub", "Custo de IA por assinante/mês (R$)", model.P["ai_cost_per_sub"], BRL2, "~8 chamadas de visão/mês; calibrar no AI Gateway"),
    ("study_ticket", "Ticket estudo patrocinado (R$)", model.Y["study_ticket"], BRL, "Hipótese B2B"),
    ("panel_ticket", "Ticket painel de tendências (R$/mês)", model.Y["panel_ticket"], BRL, "Hipótese B2B"),
]
ws["A4"], ws["B4"], ws["C4"] = "Premissa", "Valor", "Fonte / observação"
header(ws, 4, 3)
REF = {}
for i, (key, label, val, fmt, note) in enumerate(scal, start=5):
    ws[f"A{i}"], ws[f"B{i}"], ws[f"C{i}"] = label, val, note
    ws[f"B{i}"].number_format, ws[f"B{i}"].fill = fmt, INPUT
    ws[f"C{i}"].font = Font(color=MUTED, italic=True)
    REF[key] = f"Premissas!$B${i}"

r0 = 5 + len(scal) + 2
ws[f"A{r0}"] = "Premissas por ano"
ws[f"A{r0}"].font = B
ws.cell(r0 + 1, 1, "Item")
for y in range(5):
    ws.cell(r0 + 1, 2 + y, f"Ano {y + 1}")
header(ws, r0 + 1, 6)
yearly = [
    ("cpi", "Custo por instalação paga (R$)", BRL2),
    ("marketing", "Marketing (R$/mês)", BRL),
    ("organic_ratio", "Instalações orgânicas por paga", '0.0"x"'),
    ("team", "Equipe (R$/mês)", BRL),
    ("ga", "Administrativo (R$/mês)", BRL),
    ("infra", "Infra e ferramentas (R$/mês)", BRL),
    ("studies_per_year", "Estudos patrocinados (qtd/ano)", NUM),
    ("panel_clients", "Clientes do painel B2B", NUM),
    ("affiliate_per_sub", "Comissão afiliados por assinante (R$/mês)", BRL2),
]
YR = {}
for j, (key, label, fmt) in enumerate(yearly, start=r0 + 2):
    ws.cell(j, 1, label)
    for y in range(5):
        c = ws.cell(j, 2 + y, model.Y[key][y])
        c.number_format, c.fill = fmt, INPUT
    YR[key] = f"Premissas!$B${j}:$F${j}"
ws.column_dimensions["A"].width = 44
ws.column_dimensions["C"].width = 50
for col in "BDEF":
    ws.column_dimensions[col].width = 14

# ---------- Mensal ----------
wm = wb.create_sheet("Mensal")
cols = ["Mês", "Ano", "Instalações", "Novos assinantes", "Novos mensais", "Novos anuais", "Ativos mensal",
        "Renovações anuais", "Inícios anuais", "Ativos anual", "Assinantes ativos", "Receita assinaturas",
        "Receita B2B", "Receita bruta", "Taxas de loja", "Impostos", "Receita líquida", "Custo IA",
        "Marketing", "Equipe", "Administrativo", "Infra", "EBITDA", "Caixa acumulado", "CAC pago"]
for i, name in enumerate(cols, 1):
    cell = wm.cell(1, i, name)
    cell.font, cell.fill = H, HEAD
    cell.alignment = Alignment(wrap_text=True, vertical="center")
    wm.column_dimensions[L(i)].width = 13
wm.row_dimensions[1].height = 32


def yv(key, r):
    return f"INDEX({YR[key]},1,B{r})"


for m in range(1, model.MONTHS + 1):
    r = m + 1
    prev_g = f"G{r - 1}" if r > 2 else "0"
    prev_x = f"X{r - 1}" if r > 2 else "0"
    f = {
        "A": m,
        "B": f"=INT((A{r}-1)/12)+1",
        "C": f"={yv('marketing', r)}/{yv('cpi', r)}*(1+{yv('organic_ratio', r)})",
        "D": f"=C{r}*{REF['install_to_trial']}*{REF['trial_to_paid']}",
        "E": f"=D{r}*(1-{REF['mix_annual']})",
        "F": f"=D{r}*{REF['mix_annual']}",
        "G": f"={prev_g}*(1-{REF['churn_monthly']})+E{r}",
        "H": f"=I{r - 12}*{REF['renew_annual']}" if m > 12 else 0,
        "I": f"=F{r}+H{r}",
        "J": f"=SUM(I{max(2, r - 11)}:I{r})",
        "K": f"=G{r}+J{r}",
        "L": f"=G{r}*{REF['price_month']}+J{r}*{REF['price_year']}/12",
        "M": f"=K{r}*{yv('affiliate_per_sub', r)}+{yv('studies_per_year', r)}*{REF['study_ticket']}/12+{yv('panel_clients', r)}*{REF['panel_ticket']}",
        "N": f"=L{r}+M{r}",
        "O": f"=L{r}*{REF['store_fee']}",
        "P": f"=N{r}*{REF['tax']}",
        "Q": f"=N{r}-O{r}-P{r}",
        "R": f"=K{r}*{REF['ai_cost_per_sub']}",
        "S": f"={yv('marketing', r)}",
        "T": f"={yv('team', r)}",
        "U": f"={yv('ga', r)}",
        "V": f"={yv('infra', r)}",
        "W": f"=Q{r}-R{r}-S{r}-T{r}-U{r}-V{r}",
        "X": f"={prev_x}+W{r}",
        "Y": f"=S{r}/MAX(S{r}/{yv('cpi', r)}*{REF['install_to_trial']}*{REF['trial_to_paid']},1)",
    }
    for col, v in f.items():
        c = wm[f"{col}{r}"]
        c.value = v
        c.number_format = "0" if col in "AB" else (NUM if col in "CDEFGHIJK" else BRL)
        if m % 12 == 0:
            c.fill = BAND
wm.freeze_panes = "C2"

# ---------- Anual ----------
wa = wb.create_sheet("Anual", 1)
wa["A1"] = "Resumo anual"
wa["A1"].font = Font(size=16, bold=True, color=TERRA)
lines = [("Novos assinantes", "D", "sum", NUM), ("Assinantes ativos (fim do ano)", "K", "end", NUM),
         ("ARR de assinaturas (fim do ano)", "L", "arr", BRL), ("Receita bruta", "N", "sum", BRL),
         ("  de assinaturas", "L", "sum", BRL), ("  B2B (afiliados, estudos, painel)", "M", "sum", BRL),
         ("Receita líquida", "Q", "sum", BRL), ("Custo de IA", "R", "sum", BRL), ("Marketing", "S", "sum", BRL),
         ("Equipe", "T", "sum", BRL), ("Administrativo + infra", None, "ga", BRL), ("EBITDA", "W", "sum", BRL),
         ("Margem EBITDA (s/ receita líquida)", None, "margin", PCT), ("Caixa acumulado (sem aporte)", "X", "end", BRL)]
wa["A3"] = "Indicador"
for y in range(5):
    wa.cell(3, 2 + y, f"Ano {y + 1}")
header(wa, 3, 6)
for i, (label, col, kind, fmt) in enumerate(lines, start=4):
    wa.cell(i, 1, label).font = Font(color=MUTED) if label.startswith("  ") else B
    for y in range(5):
        a, b = 2 + y * 12, 13 + y * 12
        if kind == "sum":
            v = f"=SUM(Mensal!{col}{a}:{col}{b})"
        elif kind == "end":
            v = f"=Mensal!{col}{b}"
        elif kind == "arr":
            v = f"=Mensal!{col}{b}*12"
        elif kind == "ga":
            v = f"=SUM(Mensal!U{a}:V{b})"
        else:
            v = f"={L(2 + y)}15/{L(2 + y)}10"
        wa.cell(i, 2 + y, v).number_format = fmt
wa.column_dimensions["A"].width = 38
for y in range(5):
    wa.column_dimensions[L(2 + y)].width = 16
wa["A20"] = "Necessidade de caixa (pior saldo acumulado)"
wa["A20"].font = B
wa["B20"] = "=-MIN(Mensal!X2:X61)"
wa["B20"].number_format = BRL
wa["A21"] = "Mês do pior saldo"
wa["B21"] = "=MATCH(MIN(Mensal!X2:X61),Mensal!X2:X61,0)"

# ---------- Unit economics ----------
wu = wb.create_sheet("Unit economics", 2)
wu["A1"] = "Unit economics (por assinante)"
wu["A1"].font = Font(size=16, bold=True, color=TERRA)
ue = [
    ("ARPU bruto mensal", f"={REF['mix_annual']}*{REF['price_year']}/12+(1-{REF['mix_annual']})*{REF['price_month']}", BRL2),
    ("ARPU líquido de taxas, impostos e IA", f"=B3*(1-{REF['store_fee']}-{REF['tax']})-{REF['ai_cost_per_sub']}", BRL2),
    ("Margem de contribuição", "=B4/B3", PCT),
    ("Vida média (meses)", f"=(1-{REF['mix_annual']})/{REF['churn_monthly']}+{REF['mix_annual']}*12/(1-{REF['renew_annual']})", "0.0"),
    ("LTV (contribuição na vida)", "=B4*B6", BRL2),
    ("CAC pago — ano 1", "=Mensal!Y2", BRL2),
    ("CAC pago — ano 3", "=Mensal!Y26", BRL2),
    ("LTV / CAC pago — ano 1", "=B7/B8", '0.0"x"'),
    ("Payback do CAC pago — ano 1 (meses)", "=B8/B4", "0.0"),
    ("CAC misto ano 1 (com orgânico)", f"=B8/(1+INDEX({YR['organic_ratio']},1,1))", BRL2),
    ("LTV / CAC misto — ano 1", "=B7/B12", '0.0"x"'),
]
for i, (label, v, fmt) in enumerate(ue, start=3):
    wu.cell(i, 1, label)
    wu.cell(i, 2, v).number_format = fmt
wu.column_dimensions["A"].width = 42
wu.column_dimensions["B"].width = 16

# ---------- Cenários ----------
wc = wb.create_sheet("Cenários")
wc["A1"] = "Cenários (calculados por business-plan/model.py)"
wc["A1"].font = Font(size=16, bold=True, color=TERRA)
SCEN = {
    "Conservador": dict(trial_to_paid=0.25, churn_monthly=0.16, renew_annual=0.25),
    "Base": {},
    "Otimista": dict(trial_to_paid=0.55, churn_monthly=0.09, renew_annual=0.45),
}
wc["A3"] = "Indicador"
for j, name in enumerate(SCEN, start=2):
    wc.cell(3, j, name)
header(wc, 3, 4)
results = {}
for name, over in SCEN.items():
    saved = copy.deepcopy(model.P)
    model.P.update(over)
    rows = model.run()
    ys = model.yearly(rows)
    results[name] = dict(
        subs5=ys[4]["subs_end"], gross5=ys[4]["gross"], ebitda3=ys[2]["ebitda"], ebitda5=ys[4]["ebitda"],
        need=-min(x["cash"] for x in rows),
        be=next((x["m"] for x in rows if x["year"] >= 2 and x["ebitda"] > 0), None),
        ltv=model.unit_economics()["ltv"],
        years=ys,
    )
    model.P.clear()
    model.P.update(saved)
labels = [("Assinantes ativos — ano 5", "subs5", NUM), ("Receita bruta — ano 5", "gross5", BRL),
          ("EBITDA — ano 3", "ebitda3", BRL), ("EBITDA — ano 5", "ebitda5", BRL),
          ("Necessidade de caixa", "need", BRL), ("Mês de EBITDA positivo (a partir do ano 2)", "be", "0"),
          ("LTV por assinante", "ltv", BRL2)]
for i, (label, k, fmt) in enumerate(labels, start=4):
    wc.cell(i, 1, label)
    for j, name in enumerate(SCEN, start=2):
        wc.cell(i, j, results[name][k] if results[name][k] is not None else "—").number_format = fmt
wc["A12"] = "Conservador: teste→pago 25%, churn 16%, renovação 25%. Otimista: 55%, 9%, 45%. Demais premissas iguais à base."
wc["A12"].font = Font(italic=True, color=MUTED)
wc.column_dimensions["A"].width = 42
for col in "BCD":
    wc.column_dimensions[col].width = 18

# ---------- Fontes ----------
wf = wb.create_sheet("Fontes")
SOURCES = [
    ("Mercado de beleza BR ~R$ 200 bi (2025); 3º maior do mundo", "ABIHPEC", "https://abihpec.org.br/tamanho-mercado-cosmeticos-brasil-2026/"),
    ("Beleza BR R$ 186,9 bi em 2025, +6,8%", "Euromonitor via Folha do Litoral", "https://folhadolitoral.com.br/editorias/economia/mercado-de-beleza-no-brasil-cresce-em-2025/"),
    ("Dermocosméticos R$ 12,3 bi (12m até jul/25), +8,3%; 83% em loja física", "IQVIA via Panorama Farmacêutico", "https://panoramafarmaceutico.com.br/mercado-de-dermocosmeticos-movimenta-r-123-bilhoes/"),
    ("Apps de análise de pele US$ 1,82 bi (2025), CAGR 17,2% até 2036", "Future Market Insights", "https://www.futuremarketinsights.com/reports/skin-analysis-mobile-apps-market"),
    ("88% das mulheres e 64% dos homens usam skincare", "MindMiners (2024) via O Hoje", "https://ohoje.com/2025/02/27/skincare-o-novo-vicio-dos-brasileiros/"),
    ("23% usam assistentes de IA para escolher beleza; influenciadores 32% da descoberta", "Mercado & Consumo (out/2026)", "https://mercadoeconsumo.com.br/07/10/2026/noticias-varejo/seis-em-cada-dez-brasileiros-gastam-mais-de-r-100-por-mes-com-beleza/"),
    ("Teste→pago mediana Saúde & Fitness 39,9%; 2x maior no iOS", "RevenueCat — State of Subscription Apps 2025", "https://revenuecat.com/state-of-subscription-apps-2025"),
    ("Cal AI: ~US$ 30 mi ARR, adquirido pela MyFitnessPal (2025/26)", "Imprensa (não auditado)", "https://neuronfeed.com/startups/cal-ai"),
    ("Skan: soft paywall, anual US$ 24,99–39,99", "App Store / AppPricingLab", "https://apppricinglab.com/app/apple/6449196562"),
    ("Meta repassa 12,15% de impostos ao anunciante no BR", "Tecnoblog", "https://tecnoblog.net/noticias/meta-decide-repassar-os-custos-com-impostos-no-brasil-para-os-anunciantes/"),
    ("Beautytechs BR: B4A captou R$ 15 mi; UAUBox seed R$ 6 mi", "Startupi / Startups", "https://startupi.com.br/b4a-capta-r-15-milhoes-para-expandir-parcerias/"),
    ("216 reviews de 9 apps concorrentes (dores e pedidos)", "Pesquisa própria", "replica/fixes.md"),
]
wf["A1"], wf["B1"], wf["C1"] = "Dado", "Fonte", "Link"
header(wf, 1, 3)
for i, row in enumerate(SOURCES, start=2):
    for j, v in enumerate(row, start=1):
        wf.cell(i, j, v)
wf.column_dimensions["A"].width = 70
wf.column_dimensions["B"].width = 36
wf.column_dimensions["C"].width = 60

for sheet in wb.worksheets:
    sheet.sheet_view.showGridLines = False
wb.save("modelo-financeiro-vico.xlsx")
json.dump({"scenarios": results, "sources": SOURCES, "ue": model.unit_economics()}, open("data.json", "w", encoding="utf-8"),
          default=float, ensure_ascii=False, indent=1)
for k, v in results.items():
    print(k, {kk: round(vv) for kk, vv in v.items() if isinstance(vv, (int, float)) and vv is not None})
