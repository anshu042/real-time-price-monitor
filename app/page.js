import { createClient } from "@/utils/supabase/server";
import { getProducts } from "./actions";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import { Sparkles, Zap, ShieldCheck, ChartNoAxesColumn } from "lucide-react";
import AuthButton from "@/components/AuthButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const products = user ? await getProducts() : [];

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col selection:bg-primary/30">
      <div className="fixed inset-0 w-full h-full -z-10">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="absolute top-0 left-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] sm:blur-[100px] opacity-50 motion-safe:animate-blob" />
        <div className="absolute top-0 right-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-purple-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] sm:blur-[100px] opacity-50 motion-safe:animate-blob delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-blue-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] sm:blur-[100px] opacity-50 motion-safe:animate-blob delay-4000" />
      </div>

      <nav className="fixed top-0 inset-x-0 z-50 p-3 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto max-w-6xl mx-auto bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-full px-2.5 sm:px-6 py-1.5 sm:py-3 flex justify-between items-center gap-2 shadow-lg transition-all hover:bg-white/10 dark:hover:bg-black/10 hover:shadow-xl hover:scale-[1.005]">
          <div className="flex items-center gap-2 leading-none select-none group/brand min-w-0">
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-blue-600 text-white shadow-sm transition-transform duration-300 group-hover/brand:scale-110">
              <ChartNoAxesColumn className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="text-lg sm:text-2xl font-black truncate bg-gradient-to-r from-primary via-purple-500 to-blue-600 bg-clip-text text-transparent transition-all duration-300 group-hover/brand:tracking-wide">
              PriceTracker
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 pt-24 sm:pt-36 pb-12 sm:pb-20">
        <section className="text-center mb-12 sm:mb-24 space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-1000 cursor-default hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Tracking</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-backwards delay-100 drop-shadow-sm pb-4 leading-[1.1]">
            Price Intelligence
          </h1>
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-backwards delay-300 transform transition-all hover:scale-[1.01]">
            <AddProductForm user={user} />
          </div>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards delay-200">
            Monitor prices in real-time. We track the numbers so you never miss a deal again.
          </p>
        </section>

        {products.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {[
              { icon: Zap, title: "Instant", desc: "Real-time updates via WebSockets" },
              { icon: ShieldCheck, title: "Secure", desc: "Enterprise-grade bot protection" },
              { icon: Sparkles, title: "Smart", desc: "AI-predicted price drops" },
            ].map((f, i) => (
              // ADDED: flex flex-col items-center text-center
              <div key={i} className="group p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm cursor-default flex flex-col items-center text-center">
                
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-foreground/90">{f.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Tracked Products History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          </div>
        )}<br></br>
        {user && products.length === 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
          <div className="bg-card rounded-xl border-2 border-dashed border-border p-12 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No products yet
            </h2>
            <p className="text-muted-foreground">
              Add your first product above to start tracking prices!
            </p>
          </div>
        </section>
      )}
      </div>

      {/* Sits outside the flex-1 content column so it is pushed to the bottom
          of the viewport on short pages instead of floating mid-screen. */}
      <footer className="mt-auto w-full px-4 py-5 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <div className="inline-flex flex-col items-center gap-0 text-xs text-muted-foreground hover:text-foreground transition-colors group/footer">
          <span>Designed &amp; Developed by</span>
          <a
            href="https://anshhu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center justify-center pt-0.5 pb-2 text-sm font-semibold text-primary group-hover/footer:text-transparent group-hover/footer:bg-clip-text group-hover/footer:bg-gradient-to-r group-hover/footer:from-cyan-500 group-hover/footer:to-pink-500 transition-all duration-300 cursor-pointer before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-[calc(100%+1rem)] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
          >
            Anshu Kushwaha
            {/* Anchored to the text's vertical centre so the tap padding does
                not detach the rule from the words. */}
            <span className="pointer-events-none absolute left-0 right-0 top-1/2 mt-[9px] h-[1.5px] w-0 bg-gradient-to-r from-cyan-500 to-pink-500 group-hover/footer:w-full transition-all duration-300" />
          </a>
        </div>
      </footer>
    </main>
  );
}
