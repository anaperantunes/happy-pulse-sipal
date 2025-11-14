-- Criar tabela para armazenar quantidade de colaboradores
CREATE TABLE IF NOT EXISTS public.employee_counts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL UNIQUE,
  total_colaboradores integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.employee_counts ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Anyone can view employee counts" 
ON public.employee_counts 
FOR SELECT 
USING (true);

-- Política para permitir inserção pública (para upload de dados)
CREATE POLICY "Anyone can insert employee counts" 
ON public.employee_counts 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Anyone can update employee counts" 
ON public.employee_counts 
FOR UPDATE 
USING (true);

-- Inserir os dados fixos
INSERT INTO public.employee_counts (tipo, total_colaboradores) VALUES
  ('Matriz', 368),
  ('Filiais', 722),
  ('Geral', 1090)
ON CONFLICT (tipo) DO UPDATE 
SET total_colaboradores = EXCLUDED.total_colaboradores;