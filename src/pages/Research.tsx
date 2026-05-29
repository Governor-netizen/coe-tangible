import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string | any[];
};

export default function Research() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    let userContent: any = input;
    if (selectedImage) {
      userContent = [
        { type: "text", text: input || "Analyze this image." },
        { type: "image_url", image_url: { url: selectedImage } },
      ];
    }

    const newMessages = [...messages, { role: "user" as const, content: userContent }];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: newMessages },
      });

      if (error) throw error;

      // Since supabase functions invoke returns the parsed JSON for non-stream,
      // wait, the edge function uses Server-Sent Events (stream: true).
      // supabase.functions.invoke doesn't easily support streams unless we use raw fetch.
      // Let's use raw fetch with supabase anon key for streaming.
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Raw fetch for streaming response
  const streamChat = async (newMessages: Message[]) => {
    setIsLoading(true);
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const text = data.choices[0]?.delta?.content || "";
                
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  lastMsg.content = (lastMsg.content as string) + text;
                  return newMsgs;
                });
              } catch (e) {
                // Ignore parse errors from partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1].content === "") {
          newMsgs[newMsgs.length - 1].content = "Sorry, there was an error processing your request.";
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWrapper = () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    let userContent: any = input;
    if (selectedImage) {
      userContent = [
        { type: "text", text: input || "Analyze this image." },
        { type: "image_url", image_url: { url: selectedImage } },
      ];
    }

    streamChat([...messages, { role: "user" as const, content: userContent }]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required to use voice input.");
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to transcribe");
      
      const { text } = await response.json();
      setInput((prev) => prev + (prev ? " " : "") + text);
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-dim text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* SideNavBar (Shared Component) */}
        <aside className="hidden md:flex flex-col h-full py-8 border-r border-outline-variant/15 bg-surface-container-lowest dark:bg-surface-container-lowest w-64 left-0 sticky">
          <div className="px-6 mb-10">
            <div className="font-headline text-lg text-on-surface italic uppercase tracking-widest">AI_RESEARCH_UNIT</div>
            <div className="font-label text-[10px] tracking-tighter text-tertiary-fixed mt-1 opacity-70">V.02.44_ACTIVE</div>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <a onClick={() => navigate("/machines")} className="flex items-center gap-4 bg-primary-container text-on-primary-container rounded-none border-r-4 border-tertiary-fixed p-3 transition-all duration-200 active:scale-[1.01]">
              <span className="material-symbols-outlined">biotech</span>
              <span className="font-label text-xs uppercase tracking-widest">SIMULATION</span>
            </a>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-surface-container-low hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">terminal</span>
              <span className="font-label text-xs uppercase tracking-widest">TERMINAL</span>
            </a>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-surface-container-low hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">history</span>
              <span className="font-label text-xs uppercase tracking-widest">ARCHIVE</span>
            </a>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-surface-container-low hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">architecture</span>
              <span className="font-label text-xs uppercase tracking-widest">SCHEMATICS</span>
            </a>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:bg-surface-container-low hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">analytics</span>
              <span className="font-label text-xs uppercase tracking-widest">DATA_SETS</span>
            </a>
          </nav>
          <div className="px-3 mt-auto space-y-1 border-t border-outline-variant/10 pt-6">
            <button className="w-full bg-surface-container-high border border-outline-variant/20 py-3 mb-4 font-label text-[10px] tracking-[0.2em] hover:bg-primary-container hover:text-white transition-colors">
              NEW_SESSION
            </button>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label text-xs uppercase tracking-widest">SETTINGS</span>
            </a>
            <a className="flex items-center gap-4 text-on-surface-variant p-3 hover:text-primary transition-all duration-200" href="#">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label text-xs uppercase tracking-widest">LOGOUT</span>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full">
          {/* TopNavBar */}
          <header className="w-full h-16 top-0 sticky z-50 bg-surface-container-low/80 backdrop-blur-md flex justify-between items-center px-6 border-b border-outline-variant/15">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">arrow_back</span>
              </button>
              <div className="flex flex-col">
                <h1 className="font-headline text-xl text-primary tracking-tight">AI Research Assistant</h1>
                <div className="flex items-center gap-2">
                  <img alt="Tangible Logo" className="h-3 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi7rBsWdZ0A2l0JHQRUS1veJ8aEDi-Tnn0W79AGZVMtggSOBNGjTK-H1Y092WDQ4TocJ4xyzG0xVhnIqu9RNlGTcurvFI4dnfRcf162Hw9eGXq1EDfUJ4unj-MdeXJoEnx7YeOFEa-G1dVMni3V_fnuA2b_sobtTC6mamCFwO3b0eTjXYIIjQnSqt92YFyveODk_fKBg2xRT8VVj2ePb8KauVlfEdp0WZmCbcICfryjP21Jc4yII4vJ0fE2KeyjHLF0_iKoLbX4oDA" />
                  <span className="font-label text-[9px] uppercase tracking-widest text-tertiary-fixed bg-tertiary-container/20 px-1.5 py-0.5 border border-tertiary-fixed/20">POWERED BY GPT-4O</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">help</button>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">account_circle</button>
            </div>
          </header>

          {/* Chat Canvas */}
          <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-32 scroll-smooth">
            {/* System Greeting / Editorial Intro */}
            <div className="max-w-2xl mx-auto text-center mb-16 space-y-4 pt-8">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-outline">Journal Entry: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}</span>
              <h2 className="font-headline text-5xl italic text-on-surface">Precision in inquiry yields excellence in discovery.</h2>
              <p className="text-on-surface-variant font-body text-lg leading-relaxed opacity-70">
                Initiate a technical dialogue regarding high-frequency electrical engineering, photonic circuits, or semiconductor topology.
              </p>
            </div>

            {messages.map((msg, index) => {
              if (msg.role === "assistant") {
                return (
                  <div className="flex flex-col items-start max-w-4xl" key={index}>
                    <div className="bg-surface-container p-6 rounded-r-lg rounded-bl-lg border-l-2 border-primary/30 w-full relative group">
                      <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-label text-[10px] text-primary vertical-text transform rotate-180" style={{ writingMode: "vertical-rl" }}>REF: {(index+1).toString().padStart(3, '0')}-A</span>
                      </div>
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-surface-container-highest prose-pre:border prose-pre:border-outline-variant/20 max-w-none font-body text-lg text-on-surface leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content as string}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="mt-3 font-label text-[10px] uppercase tracking-widest text-outline">SYSTEM // RESEARCH_ENGINE</span>
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col items-end max-w-3xl ml-auto" key={index}>
                    <div className="bg-primary-container text-on-primary-container p-6 rounded-l-lg rounded-br-lg shadow-xl shadow-primary-container/10 border-r-2 border-tertiary-fixed/40">
                      {Array.isArray(msg.content) ? (
                        <div className="space-y-3">
                          <img
                            src={msg.content.find((c) => c.type === "image_url")?.image_url.url}
                            alt="Uploaded"
                            className="max-w-sm rounded border border-outline-variant/30"
                          />
                          <p className="font-body text-lg leading-relaxed">{msg.content.find((c) => c.type === "text")?.text}</p>
                        </div>
                      ) : (
                        <div className="font-body text-lg leading-relaxed prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content as string}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="mt-3 font-label text-[10px] uppercase tracking-widest text-outline">USER // SENIOR_ARCHITECT</span>
                  </div>
                );
              }
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-3 py-4">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-none"></div>
                  <div className="absolute inset-0 border-2 border-t-tertiary-fixed rounded-none animate-spin"></div>
                </div>
                <span className="font-label text-xs uppercase tracking-[0.2em] text-tertiary-fixed italic">Synthesizing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Dock */}
          <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-gradient-to-t from-surface-dim via-surface-dim to-transparent z-40">
            <div className="max-w-4xl mx-auto relative">
              {selectedImage && (
                <div className="absolute -top-16 left-0 bg-surface-container-high p-2 rounded border border-outline-variant/30 shadow-lg flex items-center gap-3">
                  <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-label tracking-widest uppercase"
                  >
                    REMOVE
                  </button>
                </div>
              )}
              <div className="bg-surface-container-lowest border border-outline-variant/20 shadow-2xl p-2 rounded-lg flex items-center gap-4 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-1 pl-2">
                  <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <button onClick={toggleRecording} className={`w-10 h-10 flex items-center justify-center transition-colors ${isRecording ? 'text-red-400 bg-red-400/10 rounded animate-pulse' : 'text-on-surface-variant hover:text-primary'}`}>
                    <span className="material-symbols-outlined">{isRecording ? 'stop' : 'mic'}</span>
                  </button>
                </div>
                <input
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-on-surface font-body italic text-lg placeholder:text-outline/50 px-2 py-3"
                  placeholder="Ask anything about electrical engineering..."
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendWrapper()}
                />
                <button 
                  onClick={handleSendWrapper}
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  className="bg-primary-container text-white p-3 rounded-md hover:bg-on-primary-fixed-variant disabled:opacity-50 transition-colors flex items-center justify-center group">
                  <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </button>
              </div>
              <div className="mt-3 flex justify-center gap-6">
                <button className="font-label text-[9px] uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">SCHEMATIC_VIEW</button>
                <button className="font-label text-[9px] uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">EXPORT_DOCX</button>
                <button className="font-label text-[9px] uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors">RELIABILITY_CHECK</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Decorative Corner Annotation */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none hidden md:block">
        <div className="flex flex-col items-end opacity-20">
          <span className="font-label text-[8px] tracking-[0.5em]">TANGIBLE_LABS_2026</span>
          <div className="w-24 h-[1px] bg-outline mt-1"></div>
        </div>
      </div>
    </div>
  );
}
