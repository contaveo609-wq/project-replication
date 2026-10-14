import { createFileRoute } from "@tanstack/react-router";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, KeyRound, Wifi, WifiOff, Smartphone, Trash2, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, ExternalLink, Copy, Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getWhatsAppConfigSafe, saveWhatsAppConfig, testWhatsAppConnection, removeWhatsAppIntegration,
} from "@/lib/whatsapp.server";

export const Route = createFileRoute("/admin/whatsapp")({
  component: AdminWhatsappPage,
});

function StatusBadge({ status, lastError }: { status?: string | null; lastError?: string | null }) {
  if (status === "ok") return <Badge className="bg-green-600 text-white gap-1"><CheckCircle2 className="w-3 h-3" />Conectado</Badge>;
  if (status === "error") return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Erro</Badge>;
  return <Badge variant="outline" className="text-slate-500 gap-1"><AlertCircle className="w-3 h-3" />Nao testado</Badge>;
}

function AdminWhatsappPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["admin_wa_config_v3"],
    queryFn: () => getWhatsAppConfigSafe(),
  });

  useEffect(() => {
    if (config) {
      setPhoneNumber((config as any).phone_number ?? "");
      setPhoneNumberId((config as any).phone_number_id ?? "");
      setWabaId((config as any).business_account_id ?? "");
      setWebhookUrl((config as any).endpoint_url ?? "");
      setWebhookVerifyToken((config as any).webhook_verify_token ?? "");
    }
  }, [config]);

  const isConnected = !!(config as any)?.is_connected;
  const lastStatus = (config as any)?.last_test_status;
  const lastError = (config as any)?.last_test_error;
  const lastTested = (config as any)?.last_tested_at;
  const hasToken = !!(config as any)?.has_access_token;

  const webhookEndpoint = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhook/whatsapp`
    : "/api/webhook/whatsapp";

  const handleSave = async () => {
    if (!phoneNumberId.trim()) { toast.error("Phone Number ID e obrigatorio."); return; }
    if (!wabaId.trim()) { toast.error("WABA ID e obrigatorio."); return; }
    if (!webhookVerifyToken.trim() || webhookVerifyToken.length < 6) { toast.error("Token de verificacao deve ter pelo menos 6 caracteres."); return; }

    setIsSaving(true);
    try {
      await saveWhatsAppConfig({
        data: {
          phone_number: phoneNumber || undefined,
          phone_number_id: phoneNumberId,
          business_account_id: wabaId,
          webhook_verify_token: webhookVerifyToken,
          webhook_url: webhookUrl || undefined,
          app_secret: appSecret || undefined,
        },
      });
      toast.success("Configuracoes salvas com sucesso!");
      setAccessToken("");
      setAppSecret("");
      queryClient.invalidateQueries({ queryKey: ["admin_wa_config_v3"] });
    } catch (err: unknown) {
      toast.error("Erro ao salvar: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testWhatsAppConnection();
      if ((result as any).success) {
        setTestResult({ ok: true, msg: `Conectado: ${(result as any).displayName}` });
        toast.success("Conexao verificada com sucesso!");
      } else {
        setTestResult({ ok: false, msg: (result as any).error ?? "Falha na verificacao" });
        toast.error("Falha na conexao: " + (result as any).error);
      }
      queryClient.invalidateQueries({ queryKey: ["admin_wa_config_v3"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setTestResult({ ok: false, msg });
      toast.error("Erro ao testar: " + msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeWhatsAppIntegration();
      toast.success("Integracao removida. Credenciais apagadas do sistema.");
      queryClient.invalidateQueries({ queryKey: ["admin_wa_config_v3"] });
    } catch (err: unknown) {
      toast.error("Erro ao remover: " + (err instanceof Error ? err.message : "Erro"));
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Carregando configuracoes...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-green-600" />
            WhatsApp Cloud API
          </h1>
          <p className="text-muted-foreground mt-2">
            Integracao oficial com a API da Meta para atendimento automatizado via WhatsApp Business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={lastStatus} lastError={lastError} />
          {isConnected && <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>}
        </div>
      </div>

      {/* Status Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Status da Conexao</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 border-4 shadow-inner ${isConnected ? "bg-green-100 text-green-600 border-green-50" : "bg-slate-100 text-slate-400 border-slate-50"}`}>
              {isConnected ? <Wifi className="w-10 h-10 animate-pulse" /> : <WifiOff className="w-10 h-10" />}
            </div>
            <StatusBadge status={lastStatus} lastError={lastError} />
            {(config as any)?.phone_number && (
              <p className="text-sm font-semibold text-gray-700 text-center">{(config as any).phone_number}</p>
            )}
            {lastTested && (
              <p className="text-xs text-muted-foreground text-center">
                Ultimo teste: {new Date(lastTested).toLocaleString("pt-BR")}
              </p>
            )}
            {lastError && (
              <p className="text-xs text-red-600 text-center bg-red-50 p-2 rounded-md">{lastError}</p>
            )}
            {testResult && (
              <div className={`text-xs text-center p-2 rounded-md w-full ${testResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {testResult.msg}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 bg-slate-50/50 rounded-b-xl border-t pt-4">
            <Button className="w-full" variant="outline" onClick={handleTest} disabled={isTesting || !hasToken || !(config as any)?.phone_number_id}>
              {isTesting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Testando...</> : "Testar Conexao"}
            </Button>
            {!hasToken && (
              <p className="text-xs text-amber-600 text-center">Configure WHATSAPP_ACCESS_TOKEN no servidor</p>
            )}
          </CardFooter>
        </Card>

        {/* Config Form */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Credenciais Meta Cloud API</CardTitle>
            <CardDescription>
              Configure as credenciais obtidas no <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">Meta for Developers <ExternalLink className="w-3 h-3" /></a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numero do WhatsApp Business</Label>
                <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+55 (66) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number ID <span className="text-red-500">*</span></Label>
                <Input value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} placeholder="1234567890123456" className="font-mono text-sm" />
                <p className="text-[11px] text-muted-foreground">Em: App Dashboard {">"} WhatsApp {">"} Configuration</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>WhatsApp Business Account ID (WABA ID) <span className="text-red-500">*</span></Label>
              <Input value={wabaId} onChange={e => setWabaId(e.target.value)} placeholder="1234567890123456" className="font-mono text-sm" />
            </div>

            <Separator />

            {/* Webhook */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Configuracao de Webhook
              </h3>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">URL do Webhook (use esta no painel da Meta):</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white dark:bg-slate-900 border rounded px-2 py-1 flex-1 break-all">{webhookEndpoint}</code>
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => { navigator.clipboard.writeText(webhookEndpoint); toast.success("URL copiada!"); }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL do Webhook (registro)</Label>
                  <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://seu-app.com/api/webhook/whatsapp" />
                  <p className="text-[11px] text-muted-foreground">Para registro interno — a URL real esta acima</p>
                </div>
                <div className="space-y-2">
                  <Label>Token de Verificacao <span className="text-red-500">*</span></Label>
                  <Input value={webhookVerifyToken} onChange={e => setWebhookVerifyToken(e.target.value)} placeholder="token-secreto-personalizado" className="font-mono text-sm" />
                  <p className="text-[11px] text-muted-foreground">Use o mesmo valor no painel da Meta em "Verify token"</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Credentials (write-only) */}
            <div className="space-y-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-400">Credenciais Sensiveis</span>
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                O token de acesso nao e armazenado no banco de dados — deve ser definido como variavel de ambiente 
                <code className="mx-1 bg-amber-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> no servidor.
                O campo abaixo serve apenas para referencia.
              </p>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
                  <KeyRound className="w-4 h-4" /> Token de Acesso (variavel de ambiente)
                </Label>
                <div className="flex items-center gap-2">
                  <div className={`flex-1 h-9 px-3 py-2 rounded-md border text-sm font-mono flex items-center ${hasToken ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>
                    {hasToken ? "WHATSAPP_ACCESS_TOKEN ✓ Configurado no servidor" : "WHATSAPP_ACCESS_TOKEN ✗ Nao configurado"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-amber-900 dark:text-amber-400">App Secret (opcional, para validar assinaturas)</Label>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                  Se configurado, define via variavel de ambiente <code className="bg-amber-100 px-1 rounded">WHATSAPP_APP_SECRET</code>.
                  O campo abaixo e apenas para confirmar o valor — nao e armazenado no banco.
                </p>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={appSecret}
                    onChange={e => setAppSecret(e.target.value)}
                    placeholder="Cole o App Secret aqui (nao sera armazenado)"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
              {isSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar Configuracao"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isRemoving} size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />Remover Integracao
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover integracao do WhatsApp?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as credenciais salvas (Phone Number ID, WABA ID, token de verificacao) serao apagadas do sistema.
                    Isso NAO exclui nada no painel da Meta. O atendimento automatico sera desativado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleRemove}>
                    {isRemoving ? "Removendo..." : "Sim, remover"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>

      {/* Environment Variable Guide */}
      <Card className="border-blue-200/60 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" /> Variaveis de Ambiente Necessarias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-800/80 dark:text-blue-300/80">Configure estas variaveis no ambiente de execucao do servidor (ex: .env, Cloudflare Pages, Vercel):</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "WHATSAPP_ACCESS_TOKEN", desc: "Token de acesso permanente da Meta (obrigatorio para envio)", required: true },
              { name: "WHATSAPP_APP_SECRET", desc: "App Secret para validar assinaturas HMAC dos webhooks (recomendado)", required: false },
              { name: "WHATSAPP_WEBHOOK_VERIFY_TOKEN", desc: "Alternativa ao token salvo no banco de dados", required: false },
              { name: "GEMINI_API_KEY", desc: "Chave da API do Google Gemini (obrigatorio para respostas automaticas)", required: true },
            ].map(v => (
              <div key={v.name} className="bg-white dark:bg-slate-800 border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">{v.name}</code>
                  {v.required && <Badge className="text-[10px] px-1 py-0 bg-red-100 text-red-700 border-red-200">obrigatorio</Badge>}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
          <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
            Documentacao oficial da Meta Cloud API <ExternalLink className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
