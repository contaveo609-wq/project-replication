import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot, MessageCircle, Phone, RefreshCw, Search, Send, UserRound,
  UserRoundCheck, WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  getWhatsAppConfigSafe,
  getWhatsAppConversation,
  getWhatsAppConversations,
  releaseHumanTakeover,
  sendManualWhatsAppMessage,
  takeHumanTakeover,
} from "@/lib/whatsapp.server";

export const Route = createFileRoute("/admin/conversas-whatsapp")({
  component: WhatsAppConversationsPage,
});

type Conversation = {
  phone: string;
  display_name: string | null;
  is_human_takeover: boolean;
  human_takeover_at: string | null;
  last_message_at: string;
  created_at: string;
  last_message: { role: "user" | "model"; content: string; created_at: string } | null;
};

type ChatMessage = { role: "user" | "model"; content: string; created_at: string };

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

function formatWhen(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = date.toDateString() === new Date().toDateString();
  return date.toLocaleString("pt-BR", isToday
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function contactInitial(conversation: Conversation) {
  return (conversation.display_name?.trim()[0] || conversation.phone.slice(-2) || "?").toUpperCase();
}

function WhatsAppConversationsPage() {
  const queryClient = useQueryClient();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const configQuery = useQuery({
    queryKey: ["whatsapp-config-safe"],
    queryFn: () => getWhatsAppConfigSafe(),
    refetchInterval: 30_000,
  });
  const conversationsQuery = useQuery({
    queryKey: ["whatsapp-conversations"],
    queryFn: () => getWhatsAppConversations(),
    refetchInterval: 8_000,
  });
  const conversationQuery = useQuery({
    queryKey: ["whatsapp-conversation", selectedPhone],
    queryFn: () => getWhatsAppConversation({ data: { phone: selectedPhone!, limit: 300 } }),
    enabled: !!selectedPhone,
    refetchInterval: 5_000,
  });

  const conversations = (conversationsQuery.data as { conversations?: Conversation[] } | undefined)?.conversations ?? [];
  const selectedConversation = (conversationQuery.data as any)?.conversation as Conversation | null | undefined;
  const messages = ((conversationQuery.data as any)?.messages ?? []) as ChatMessage[];

  useEffect(() => {
    if (!selectedPhone && conversations.length) setSelectedPhone(conversations[0]!.phone);
  }, [conversations, selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedPhone, messages.length]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.display_name ?? ""} ${conversation.phone}`.toLowerCase().includes(term)
    );
  }, [conversations, search]);

  const refreshInbox = () => queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations"] });
  const refreshSelected = () => {
    refreshInbox();
    return queryClient.invalidateQueries({ queryKey: ["whatsapp-conversation", selectedPhone] });
  };

  const takeoverMutation = useMutation({
    mutationFn: () => takeHumanTakeover({
      data: { phone: selectedPhone!, display_name: selectedConversation?.display_name ?? undefined },
    }),
    onSuccess: () => { toast.success("Atendimento assumido pela equipe."); refreshSelected(); },
    onError: () => toast.error("Não foi possível assumir este atendimento."),
  });
  const releaseMutation = useMutation({
    mutationFn: () => releaseHumanTakeover({ data: { phone: selectedPhone! } }),
    onSuccess: () => { toast.success("Atendimento devolvido para a IA."); refreshSelected(); },
    onError: () => toast.error("Não foi possível devolver o atendimento à IA."),
  });
  const sendMutation = useMutation({
    mutationFn: (content: string) => sendManualWhatsAppMessage({
      data: {
        to_phone: selectedPhone!,
        message: content,
        display_name: selectedConversation?.display_name ?? undefined,
      },
    }),
    onSuccess: (result: any) => {
      if (!result?.success) {
        toast.error(result?.error ?? "A mensagem não pôde ser enviada.");
        return;
      }
      setMessage("");
      toast.success(result.persisted === false
        ? "Mensagem enviada, mas o histórico não foi salvo."
        : "Mensagem enviada pelo WhatsApp.");
      refreshSelected();
    },
    onError: () => toast.error("Erro ao enviar a mensagem."),
  });

  const isConnected = !!(configQuery.data as any)?.is_connected && !!(configQuery.data as any)?.has_access_token;
  const isHuman = !!selectedConversation?.is_human_takeover;
  const handleSend = () => {
    const content = message.trim();
    if (!content || !selectedPhone || sendMutation.isPending) return;
    sendMutation.mutate(content);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageCircle className="h-7 w-7 text-green-600" /> Conversas WhatsApp
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Atenda clientes e acompanhe o que a IA respondeu, sem sair do painel.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={isConnected ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
            {isConnected ? "WhatsApp conectado" : "WhatsApp não conectado"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => { refreshInbox(); queryClient.invalidateQueries({ queryKey: ["whatsapp-conversation", selectedPhone] }); }}>
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      {!isConnected && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="h-4 w-4 shrink-0" />
          Configure e teste a integração na página WhatsApp antes de enviar mensagens por aqui.
        </div>
      )}

      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border bg-background shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b bg-muted/20 lg:border-b-0 lg:border-r">
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Buscar contato ou número" />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationsQuery.isLoading && <p className="p-5 text-sm text-muted-foreground">Carregando conversas…</p>}
            {!conversationsQuery.isLoading && filteredConversations.length === 0 && (
              <div className="p-7 text-center text-sm text-muted-foreground">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 opacity-40" />
                Nenhuma conversa recebida ainda.
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const selected = conversation.phone === selectedPhone;
              return (
                <button key={conversation.phone} type="button" onClick={() => setSelectedPhone(conversation.phone)}
                  className={`flex w-full gap-3 border-b px-4 py-3 text-left transition-colors ${selected ? "bg-green-50" : "hover:bg-muted/60"}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-semibold text-white">
                    {contactInitial(conversation)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{conversation.display_name || formatPhone(conversation.phone)}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatWhen(conversation.last_message_at)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {conversation.is_human_takeover ? <UserRound className="h-3.5 w-3.5 text-blue-600" /> : <Bot className="h-3.5 w-3.5 text-violet-600" />}
                      <p className="truncate text-xs text-muted-foreground">{conversation.last_message?.content || (conversation.is_human_takeover ? "Em atendimento humano" : "Atendimento por IA")}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[linear-gradient(135deg,hsl(var(--muted)/0.42),transparent_55%)]">
          {!selectedPhone ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageCircle className="mb-3 h-12 w-12 opacity-30" />
              <p className="font-medium">Selecione uma conversa para começar.</p>
              <p className="mt-1 text-sm">As mensagens recebidas pelo webhook aparecem aqui.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background/90 px-5 py-3 backdrop-blur">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-semibold text-white">
                    {selectedConversation ? contactInitial(selectedConversation) : "…"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{selectedConversation?.display_name || formatPhone(selectedPhone)}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {formatPhone(selectedPhone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={isHuman ? "border-blue-200 bg-blue-50 text-blue-700" : "border-violet-200 bg-violet-50 text-violet-700"}>
                    {isHuman ? <UserRound className="mr-1 h-3 w-3" /> : <Bot className="mr-1 h-3 w-3" />}
                    {isHuman ? "Equipe atendendo" : "IA atendendo"}
                  </Badge>
                  {isHuman ? (
                    <Button size="sm" variant="outline" disabled={releaseMutation.isPending} onClick={() => releaseMutation.mutate()}>
                      <Bot className="mr-1.5 h-4 w-4" /> Devolver à IA
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled={takeoverMutation.isPending} onClick={() => takeoverMutation.mutate()}>
                      <UserRoundCheck className="mr-1.5 h-4 w-4" /> Assumir
                    </Button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                {conversationQuery.isLoading && <p className="text-center text-sm text-muted-foreground">Carregando mensagens…</p>}
                {!conversationQuery.isLoading && messages.length === 0 && <p className="pt-10 text-center text-sm text-muted-foreground">Ainda não há mensagens salvas para este contato.</p>}
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                  {messages.map((chatMessage, index) => {
                    const incoming = chatMessage.role === "user";
                    return (
                      <div key={`${chatMessage.created_at}-${index}`} className={`flex ${incoming ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${incoming ? "rounded-tl-sm bg-background" : "rounded-tr-sm bg-green-600 text-white"}`}>
                          <p className="whitespace-pre-wrap break-words">{chatMessage.content}</p>
                          <p className={`mt-1 text-right text-[10px] ${incoming ? "text-muted-foreground" : "text-green-100"}`}>
                            {formatWhen(chatMessage.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t bg-background p-3 sm:p-4">
                <div className="flex items-end gap-2">
                  <Textarea value={message} disabled={!isConnected || sendMutation.isPending} onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }}
                    maxLength={1000} rows={2} placeholder={isConnected ? "Escreva uma mensagem… (Enter para enviar)" : "Conecte o WhatsApp para enviar mensagens"}
                    className="min-h-[48px] resize-none" />
                  <Button className="h-11 bg-green-600 hover:bg-green-700" disabled={!isConnected || !message.trim() || sendMutation.isPending} onClick={handleSend}>
                    <Send className="h-4 w-4" /><span className="sr-only">Enviar mensagem</span>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Ao enviar, o atendimento é assumido pela equipe para evitar respostas simultâneas da IA.</p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
