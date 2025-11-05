import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, Zap, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-foreground">SkyHub</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="cursor-pointer">
                Acessar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="cursor-pointer">Registrar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Encontre o seu próximo destino
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Busque, reserve e gerencie seus voos com facilidade. A melhor experiência em viagens aéreas está aqui.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Origem</label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      <option>São Paulo (GRU)</option>
                      <option>Rio de Janeiro (GIG)</option>
                      <option>Belo Horizonte (CNF)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Destino</label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      <option>Miami (MIA)</option>
                      <option>Nova York (JFK)</option>
                      <option>Londres (LHR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Data</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full h-10 bg-primary hover:bg-primary/90 cursor-pointer">Buscar Voos</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: "Rápido", desc: "Busca instantânea de voos" },
            { icon: Shield, title: "Seguro", desc: "Pagamento protegido" },
            { icon: Clock, title: "24/7", desc: "Suporte disponível" },
            { icon: Plane, title: "Global", desc: "Milhões de rotas" },
          ].map((feature, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6 text-center space-y-4">
                <feature.icon className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted mt-32 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2025 SkyHub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
