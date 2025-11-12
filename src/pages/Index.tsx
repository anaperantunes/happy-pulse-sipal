import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, TrendingUp, Users, MessageSquare, Calendar, LogOut } from "lucide-react";
import logoSipal from "@/assets/logo-sipal.png";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { HappinessChart } from "@/components/dashboard/HappinessChart";
import { ImpactChart } from "@/components/dashboard/ImpactChart";
import { UnitDistributionChart } from "@/components/dashboard/UnitDistributionChart";
import { WordCloudChart } from "@/components/dashboard/WordCloudChart";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { SurveyResponse } from "@/types/survey";
import { processData } from "@/utils/dataProcessor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        } else {
          // Check admin role after auth state changes
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if user is admin
  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  // Load data from database on mount
  useEffect(() => {
    if (!session) return;
    const loadData = async () => {
      try {
        const { data: responses, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .order('created_at', { ascending: false });

        if (responsesError) throw responsesError;

        const { data: metadata, error: metadataError } = await supabase
          .from('survey_metadata')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        if (metadataError && metadataError.code !== 'PGRST116') {
          throw metadataError;
        }

        if (responses && responses.length > 0) {
          const formattedResponses: SurveyResponse[] = responses.map(r => ({
            local: r.local,
            felicidade: r.felicidade,
            fatoresPositivos: r.fatores_positivos || "",
            fatoresNegativos: r.fatores_negativos || "",
            impacto: r.impacto || "",
            comentarios: r.comentarios || "",
            tipo_unidade: r.tipo_unidade as "Filial" | "Matriz"
          }));

          setResponses(formattedResponses);
          setLastUpdate(metadata?.last_updated || new Date().toISOString());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [session]);

  const handleDataLoaded = (data: SurveyResponse[], timestamp: string) => {
    setResponses(data);
    setLastUpdate(timestamp);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const formatLastUpdate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResponses = useMemo(() => {
    if (selectedUnit === "all") return responses;
    return responses.filter(r => r.tipo_unidade === selectedUnit);
  }, [responses, selectedUnit]);

  const processedData = useMemo(() => {
    if (filteredResponses.length === 0) return null;
    return processData(filteredResponses);
  }, [filteredResponses]);

  const totalResponses = filteredResponses.length;
  const happyPercentage = processedData
    ? ((processedData.happinessDistribution.filter(h => h.nivel >= 4).reduce((sum, h) => sum + h.count, 0) / totalResponses) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">
                Pesquisa de Felicidade no Trabalho
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard SIPAL - Análise em tempo real
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img 
                src={logoSipal} 
                alt="Logo SIPAL" 
                className="h-16 w-auto object-contain"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">
        {responses.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            {isAdmin ? (
              <FileUpload onDataLoaded={handleDataLoaded} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma resposta encontrada. Entre em contato com um administrador para fazer upload dos dados.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex items-center justify-start gap-4">
              <div className="max-w-xs">
                <FilterPanel
                  selectedUnit={selectedUnit}
                  onUnitChange={setSelectedUnit}
                />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Média Geral de Felicidade"
                value={processedData?.averageHappiness.toFixed(1) || "0.0"}
                icon={Heart}
                subtitle="Escala de 1 a 5"
              />
              <MetricCard
                title="Colaboradores Felizes"
                value={`${happyPercentage}%`}
                icon={TrendingUp}
                subtitle="Notas 4 e 5"
              />
              <MetricCard
                title="Total de Respostas"
                value={totalResponses}
                icon={Users}
              />
              <MetricCard
                title="Comentários Recebidos"
                value={filteredResponses.filter(r => r.comentarios && r.comentarios.trim() !== "").length}
                icon={MessageSquare}
              />
            </div>

            {/* Charts */}
            {processedData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HappinessChart data={processedData.happinessDistribution} />
                  <ImpactChart data={processedData.impactDistribution} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UnitDistributionChart data={processedData.unitDistribution} />
                  <WordCloudChart data={processedData.wordFrequency} />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer with last update info and update button */}
      {responses.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Última atualização: {formatLastUpdate(lastUpdate)}</span>
              </div>
              {isAdmin && <FileUpload onDataLoaded={handleDataLoaded} compact />}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
