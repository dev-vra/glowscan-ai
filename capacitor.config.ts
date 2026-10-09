import type { CapacitorConfig } from "@capacitor/cli";

// App nativo = casca do site em produção (server.url). Trocar CAP_SERVER_URL ao mudar de domínio.
const serverUrl = process.env.CAP_SERVER_URL ?? "https://vico-beta.vercel.app";

const config: CapacitorConfig = {
  appId: "app.vico.beta",
  appName: "Viço",
  webDir: "capacitor/www",
  backgroundColor: "#FFFBF8",
  // O site usa isto para esconder o login Google (o Google bloqueia login dentro de WebView).
  appendUserAgent: "VicoApp",
  server: { url: serverUrl, cleartext: false },
  android: { allowMixedContent: false },
};

export default config;
