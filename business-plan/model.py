"""Modelo financeiro do Viço (60 meses). Fonte única dos números do plano, da planilha e do pitch."""
P = dict(
    price_month=24.90, price_year=199.0, mix_annual=0.60,
    store_fee=0.10,      # mix web (Stripe ~4%) + lojas (15% small business) → ~10%
    tax=0.11,            # Simples Nacional, anexo III/V (estimativa; validar com contador)
    install_to_trial=0.12, trial_to_paid=0.40,  # RevenueCat 2025: mediana H&F 39,9%
    churn_monthly=0.12, renew_annual=0.35,
    ai_cost_per_sub=1.50,  # R$/assinante/mês (≈ 8 chamadas de visão; calibrar no AI Gateway)
)
Y = dict(  # por ano 1..5
    cpi=[4.0, 4.5, 5.0, 5.5, 6.0],
    marketing=[25_000, 110_000, 240_000, 380_000, 520_000],
    organic_ratio=[0.4, 0.7, 1.0, 1.2, 1.4],
    team=[22_000, 85_000, 170_000, 260_000, 350_000],
    ga=[5_000, 12_000, 20_000, 30_000, 40_000],
    infra=[1_500, 4_000, 9_000, 15_000, 22_000],
    studies_per_year=[0, 4, 10, 16, 24], study_ticket=40_000,
    panel_clients=[0, 0, 3, 6, 10], panel_ticket=8_000,
    affiliate_per_sub=[0.40, 0.80, 1.00, 1.20, 1.30],
)
MONTHS = 60

def run(raise_amount=0.0):
    rows, monthly, starts, cash = [], 0.0, [], raise_amount
    for m in range(1, MONTHS + 1):
        y = (m - 1) // 12
        paid_installs = Y["marketing"][y] / Y["cpi"][y]
        installs = paid_installs * (1 + Y["organic_ratio"][y])
        new_subs = installs * P["install_to_trial"] * P["trial_to_paid"]
        new_m, new_a = new_subs * (1 - P["mix_annual"]), new_subs * P["mix_annual"]
        monthly = monthly * (1 - P["churn_monthly"]) + new_m
        renewals = starts[-12] * P["renew_annual"] if len(starts) >= 12 else 0.0
        starts.append(new_a + renewals)
        annual = sum(starts[-12:])
        subs = monthly + annual
        gross_subs = monthly * P["price_month"] + annual * P["price_year"] / 12
        affiliate = subs * Y["affiliate_per_sub"][y]
        studies = Y["studies_per_year"][y] * Y["study_ticket"] / 12
        panel = Y["panel_clients"][y] * Y["panel_ticket"]
        gross = gross_subs + affiliate + studies + panel
        fees = gross_subs * P["store_fee"]
        taxes = gross * P["tax"]
        net = gross - fees - taxes
        ai = subs * P["ai_cost_per_sub"]
        opex = Y["marketing"][y] + Y["team"][y] + Y["ga"][y] + Y["infra"][y]
        ebitda = net - ai - opex
        cash += ebitda
        cac = Y["marketing"][y] / max(paid_installs * P["install_to_trial"] * P["trial_to_paid"], 1)
        rows.append(dict(m=m, year=y + 1, installs=installs, new_subs=new_subs, subs=subs, monthly=monthly, annual=annual,
                         gross_subs=gross_subs, b2b=affiliate + studies + panel, gross=gross, net=net, ai=ai,
                         marketing=Y["marketing"][y], team=Y["team"][y], ga=Y["ga"][y], infra=Y["infra"][y],
                         ebitda=ebitda, cash=cash, cac=cac))
    return rows

def yearly(rows):
    out = []
    for y in range(1, 6):
        r = [x for x in rows if x["year"] == y]
        s = lambda k: sum(x[k] for x in r)
        out.append(dict(year=y, subs_end=r[-1]["subs"], new_subs=s("new_subs"), gross=s("gross"), gross_subs=s("gross_subs"),
                         b2b=s("b2b"), net=s("net"), ai=s("ai"), opex=s("marketing") + s("team") + s("ga") + s("infra"),
                         marketing=s("marketing"), ebitda=s("ebitda"), cash_end=r[-1]["cash"], arr_end=r[-1]["gross_subs"] * 12,
                         cac=r[-1]["cac"]))
    return out

def unit_economics():
    arpu = (P["mix_annual"] * P["price_year"] / 12 + (1 - P["mix_annual"]) * P["price_month"])
    net_arpu = arpu * (1 - P["store_fee"] - P["tax"]) - P["ai_cost_per_sub"]
    # vida média ponderada: mensal 1/churn; anual 12 meses / (1 - renovação)
    life = (1 - P["mix_annual"]) * (1 / P["churn_monthly"]) + P["mix_annual"] * (12 / (1 - P["renew_annual"]))
    return dict(arpu=arpu, net_arpu=net_arpu, life_months=life, ltv=net_arpu * life)

if __name__ == "__main__":
    base = run()
    need = -min(r["cash"] for r in base)
    print(f"caixa mínimo sem aporte: {-need:,.0f} (mês {min(base, key=lambda r: r['cash'])['m']})")
    be = next((r["m"] for r in base if r["ebitda"] > 0), None)
    print("1º mês EBITDA+:", be)
    for y in yearly(base):
        print({k: round(v) for k, v in y.items()})
    print({k: round(v, 2) for k, v in unit_economics().items()})
