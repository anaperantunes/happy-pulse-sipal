-- Create table for survey responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local TEXT NOT NULL,
  felicidade INTEGER NOT NULL CHECK (felicidade >= 1 AND felicidade <= 5),
  fatores_positivos TEXT,
  fatores_negativos TEXT,
  impacto TEXT,
  comentarios TEXT,
  tipo_unidade TEXT NOT NULL CHECK (tipo_unidade IN ('Matriz', 'Filial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for survey metadata (last update info)
CREATE TABLE public.survey_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_responses INTEGER NOT NULL DEFAULT 0,
  uploaded_by TEXT
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_metadata ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the data)
CREATE POLICY "Anyone can view survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view survey metadata" 
ON public.survey_metadata 
FOR SELECT 
USING (true);

-- Public write access (anyone can insert/update)
-- Note: In production, you may want to restrict this
CREATE POLICY "Anyone can insert survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete survey responses" 
ON public.survey_responses 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can insert survey metadata" 
ON public.survey_metadata 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update survey metadata" 
ON public.survey_metadata 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete survey metadata" 
ON public.survey_metadata 
FOR DELETE 
USING (true);

-- Create index for better query performance
CREATE INDEX idx_survey_responses_tipo_unidade ON public.survey_responses(tipo_unidade);
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses(created_at DESC);