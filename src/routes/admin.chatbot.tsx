import { createFileRoute } from "@tanstack/react-router";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot, Save, Sparkles, Key, Zap, ExternalLink, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getGeminiConfigSafe, saveGeminiConfig, testGeminiConnection, listGeminiModels,
} from "@/lib/whatsapp.server";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/chatbot")({
  component: AdminChatbotPage,
});

const GEMINI_MODELS = [
  {
    id: "gemini-2.5-flash-lite-preview-06-17",
    name: "Gemini 2.5 Flash Lite",
    tag: "ECONOMICO",
    tagColor: "bg-green-600",
    desc: "Modelo mais leve e rapido. Ideal para atendimento frequente com baixo custo. Respostas simples e diretas.",
    speed: "Muito rapido",
    inputCost: "~$0,10 / 1M tokens",
    outputCost: "~$0,40 / 1M tokens",
    freeInfo: "Disponivel no plano gratuito com limites — consulte sua conta",
    note: "Recomendado para volume alto e respostas simples",
    recommended: true,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "BALANCEADO",
    tagColor: "bg-blue-600",
    desc: "Versao completa do Flash. Mais inteligente que o Lite, ideal para conversas complexas e perguntas ambiguas.",
    speed: "Rapido",
    inputCost: "~$0,30 / 1M tokens",
    outputCost: "~$2,50 / 1M tokens",
    freeInfo: "Disponivel no plano gratuito com limites — consulte sua conta",
    note: "Bom equilibrio entre qualidade e custo",
    recommended: false,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    tag: "ALTERNATIVA",
    tagColor: "bg-purple-600",
    desc: "Geracao anterior, ainda amplamente disponivel. Rapido e confiavel para atendimentos padrao.",
    speed: "Rapido",
    inputCost: "~$0,10 / 1M tokens",
    outputCost: "~$0,40 / 1M tokens",
    freeInfo: "Disponivel no plano gratuito com limites — consulte sua conta",
    note: "Boa alternativa se o 2.5 Lite nao estiver disponivel",
    recommended: false,
  },
];

function AdminChatbotPage() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [greeting, setGreeting] = useState("");
  const [isActiveSite, setIsActiveSite] = useState(false);
  const [isActiveWA, setIsActiveWA] = useState(false);
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash-lite-preview-06-17");
  const [dailyLimit, setDailyLimit] = useState(500);
  const [geminiKey, setGeminiKey] = useState("");
  const [testResult, setTestResult] = useState<{ ok: boolean; detail: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Site chatbot config (existing)
  const { data: siteConfig } = useQuery({
    queryKey: ["admin_chatbot_config"],
    queryFn: async () => {
      const { data } = await supabase.from("chatbot_settings").select("*").maybeSingle();
      return data;
    },
  });

  // Gemini / WhatsApp AI config
  const { data: geminiConfig, isLoading } = useQuery({
    queryKey: ["admin_gemini_config"],
    queryFn: () => getGeminiConfigSafe(),
  });

  useEffect(() => {
    if (siteConfig) {
      setPrompt((siteConfig as any).system_prompt ?? "");
      setGreeting((siteConfig as any).welcome_message ?? "");
      setIsActiveSite((siteConfig as any).is_enabled ?? false);
    }
  }, [siteConfig]);

  useEffect(() => {
    if (geminiConfig) {
      setGeminiModel((geminiConfig as any).gemini_model ?? "gemini-2.5-flash-lite-preview-06-17");
      setDailyLimit((geminiConfig as any).daily_limit ?? 500);
      setIsActiveWA((geminiConfig as any).is_active ?? false);
    }
  }, [geminiConfig]);

  const saveSiteMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        system_prompt: prompt,
        welcome_message: greeting,
        is_enabled: isActiveSite,
        id: (siteConfig as any)?.id,
      };
      if ((siteConfig as any)?.id) {
        await supabase.from("chatbot_settings").update(payload).eq("id", (siteConfig as any).id);
      } else {
        await supabase.from("chatbot_settings").insert(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_chatbot_config"] });
      toast.success("Configuracoes do chatbot do site salvas!");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const saveGeminiMutation = useMutation({
    mutationFn: () => saveGeminiConfig({
      data: {
        gemini_api_key: geminiKey || undefined,
        gemini_model: geminiModel,
        ai_instructions: prompt,
        is_active: isActiveWA,
        daily_limit: dailyLimit,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_gemini_config"] });
      setGeminiKey("");
      toast.success("Configuracoes Gemini salvas! Lembre de definir GEMINI_API_KEY no servidor.");
    },
    onError: (e: unknown) => toast.error("Erro: " + (e instanceof Error ? e.message : "Erro")),
  });

  const handleTestGemini = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const r = await testGeminiConnection();
      if ((r as any).success) {
        setTestResult({ ok: true, detail: `Resposta: "${(r as any).reply}" | Modelo: ${(r as any).model} | Tempo: ${(r as any).elapsed}ms | Tokens: ${(r as any).tokensUsed ?? "n/d"}` });
        toast.success("Conexao com Gemini verificada!");
      } else {
        setTestResult({ ok: false, detail: (r as any).error ?? "Falha" });
        toast.error("Falha: " + (r as any).error);
      }
    } catch (e: unknown) {
      setTestResult({ ok: false, detail: e instanceof Error ? e.message : "Erro" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    try {
      const r = await listGeminiModels();
      if ((r as any).success && (r as any).models.length > 0) {
        const names = (r as any).models.map((m: Record<string,unknown>) => {
          const name = m['name'] as string;
          return name.replace("models/", "");
        });
        setAvailableModels(names);
        toast.success(`${names.length} modelos encontrados na sua conta.`);
      } else {
        toast.error((r as any).error ?? "Nenhum modelo encontrado.");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao consultar modelos");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const hasApiKey = !!(geminiConfig as any)?.has_api_key;

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-600" />Atendente IA — Gemini
          </h1>
          <p className="text-muted-foreground mt-2">Configure a inteligencia artificial de atendimento no WhatsApp e no site.</p>
        </div>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />IA — WhatsApp (Gemini)
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />Chatbot do Site (Brenda)
          </TabsTrigger>
        </TabsList>

        {/* GEMINI / WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">

          {/* API Key Card */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Key className="h-5 w-5 text-indigo-600" />Inteligencia Artificial — Gemini
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Configure a chave de API e o modelo. A chave nao e armazenada no banco — use variavel de ambiente.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{isActiveWA ? "Ativa (WhatsApp)" : "Inativa"}</span>
                  <Switch checked={isActiveWA} onCheckedChange={setIsActiveWA} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Status */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${hasApiKey ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                {hasApiKey
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                }
                <div>
                  <p className={`text-sm font-semibold ${hasApiKey ? "text-green-800" : "text-amber-800"}`}>
                    {hasApiKey ? "GEMINI_API_KEY configurada no servidor" : "GEMINI_API_KEY nao configurada"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasApiKey
                      ? `Chave registrada: ${(geminiConfig as any)?.gemini_api_key_masked ?? "****"}`
                      : "Configure a variavel de ambiente GEMINI_API_KEY no servidor para ativar as respostas automaticas."
                    }
                  </p>
                </div>
              </div>

              {/* Key input (guidance only) */}
              <div className="space-y-2 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200">
                <Label className="text-amber-900 font-semibold">Chave da API Gemini</Label>
                <p className="text-xs text-amber-700/80">
                  Por seguranca, a chave nao e armazenada no banco de dados.
                  Defina a variavel de ambiente <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> no servidor.
                  O campo abaixo e apenas para confirmar/atualizar a referencia mascarada no painel.
                </p>
                <Input
                  type="password"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder={hasApiKey ? "••••••••••• (salva uma nova para substituir)" : "Cole a chave AIza... aqui"}
                  className="font-mono max-w-md"
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="text-indigo-700 border-indigo-300" onClick={handleTestGemini} disabled={isTesting || !hasApiKey}>
                    {isTesting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Testando...</> : "Testar Conexao"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />Obter chave no Google AI Studio
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg border text-sm ${testResult.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {testResult.ok ? <CheckCircle2 className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
                  {testResult.detail}
                </div>
              )}

              {/* Daily limit */}
              <div className="space-y-2">
                <Label>Limite diario de atendimentos automaticos</Label>
                <div className="flex items-center gap-3">
                  <Input type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="max-w-[140px]" min={1} max={99999} />
                  <span className="text-sm text-muted-foreground">respostas/dia</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Hoje: {(geminiConfig as any)?.daily_used ?? 0} usadas
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Apos atingir o limite, o sistema encaminha para atendimento humano.</p>
              </div>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" />Seletor de Modelos Gemini</CardTitle>
                  <CardDescription className="mt-1">Escolha o modelo com base em custo, velocidade e inteligencia necessarios para seu negocio.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleFetchModels} disabled={isFetchingModels || !hasApiKey}>
                  {isFetchingModels ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Consultar minha conta"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableModels.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-green-800 mb-2">Modelos disponiveis na sua conta:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableModels.filter(m => m.includes("gemini")).slice(0, 15).map(m => (
                      <Badge key={m} variant="outline" className="text-xs cursor-pointer hover:bg-green-100" onClick={() => setGeminiModel(m)}>{m}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                {GEMINI_MODELS.map(m => (
                  <div key={m.id} className="relative">
                    <div
                      onClick={() => setGeminiModel(m.id)}
                      className={`flex flex-col h-full p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${geminiModel === m.id ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-gray-200 bg-white dark:bg-slate-800 hover:border-gray-300"}`}
                    >
                      {m.recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">RECOMENDADO</div>
                      )}
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</span>
                        <Badge className={`${m.tagColor} text-white text-[9px] px-1.5 py-0.5`}>{m.tag}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 mb-3">{m.desc}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Velocidade:</span><span className="font-medium">{m.speed}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Entrada:</span><span className="font-mono">{m.inputCost}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Saida:</span><span className="font-mono">{m.outputCost}</span></div>
                      </div>
                      <div className="mt-3 pt-2 border-t text-[10px] text-blue-600">{m.freeInfo}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <Info className="w-3 h-3 inline mr-1" />
                <strong>Nota sobre limites gratuitos:</strong> Os limites reais dependem da sua conta Google, projeto e status de faturamento. 
                Clique em "Consultar minha conta" para ver modelos disponíveis ou acesse{" "}
                <a href="https://ai.google.dev/pricing" target="_blank" rel="noreferrer" className="underline">ai.google.dev/pricing</a>.
                Os custos acima sao estimativas públicas e podem variar.
              </div>

              <div className="space-y-2">
                <Label>Instrucoes da IA (System Prompt para WhatsApp)</Label>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-xs mb-1">
                  <strong>Atencao:</strong> Estas instrucoes definem o comportamento da IA no WhatsApp.
                  A regra de nunca inventar dados esta programada no backend e nao pode ser removida pelo cliente.
                </div>
                <Textarea
                  className="w-full min-h-[200px] font-mono text-sm leading-relaxed"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Voce e a Brenda, atendente virtual da Skina do Frango & Assados..."
                />
              </div>
            </CardContent>
          </Card>

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => saveGeminiMutation.mutate()}
            disabled={saveGeminiMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveGeminiMutation.isPending ? "Salvando..." : "Salvar Configuracoes Gemini"}
          </Button>
        </TabsContent>

        {/* SITE CHATBOT */}
        <TabsContent value="site">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Bot className="h-5 w-5 text-indigo-600" />Chatbot do Site (Brenda)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Configura o widget de chat existente no site. Independente do atendimento via WhatsApp.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{isActiveSite ? "Ativado" : "Desativado"}</span>
                  <Switch checked={isActiveSite} onCheckedChange={setIsActiveSite} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Mensagem de Saudacao</label>
                <p className="text-xs text-gray-500">Primeira mensagem exibida ao cliente ao abrir o chat do site.</p>
                <Textarea
                  className="w-full min-h-[80px]"
                  value={greeting}
                  onChange={e => setGreeting(e.target.value)}
                  placeholder="Ola! Sou a Brenda, atendente da Skina do Frango..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Instrucoes Base (System Prompt)</label>
                <Textarea
                  className="w-full min-h-[200px] font-mono text-sm"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Voce e Brenda, atendente virtual da Skina do Frango..."
                />
              </div>
            </CardContent>
          </Card>
          <div className="mt-4">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => saveSiteMutation.mutate()}
              disabled={saveSiteMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {saveSiteMutation.isPending ? "Salvando..." : "Salvar Chatbot do Site"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
