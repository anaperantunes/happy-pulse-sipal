-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can insert survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can update survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Admins can delete survey responses" ON public.survey_responses;

DROP POLICY IF EXISTS "Authenticated users can view survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Admins can insert survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Admins can update survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Admins can delete survey metadata" ON public.survey_metadata;

-- Create public access policies for survey_responses
CREATE POLICY "Anyone can view survey responses"
  ON public.survey_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert survey responses"
  ON public.survey_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update survey responses"
  ON public.survey_responses
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete survey responses"
  ON public.survey_responses
  FOR DELETE
  USING (true);

-- Create public access policies for survey_metadata
CREATE POLICY "Anyone can view survey metadata"
  ON public.survey_metadata
  FOR SELECT
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