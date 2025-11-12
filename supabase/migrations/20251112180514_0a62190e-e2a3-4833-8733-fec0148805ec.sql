-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Policy for user_roles: only admins can insert roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update survey_responses RLS policies
DROP POLICY IF EXISTS "Anyone can view survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can insert survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can delete survey responses" ON public.survey_responses;

-- New authenticated-only policies for survey_responses
CREATE POLICY "Authenticated users can view survey responses"
ON public.survey_responses FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert survey responses"
ON public.survey_responses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey responses"
ON public.survey_responses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey responses"
ON public.survey_responses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update survey_metadata RLS policies
DROP POLICY IF EXISTS "Anyone can view survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Anyone can insert survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Anyone can update survey metadata" ON public.survey_metadata;
DROP POLICY IF EXISTS "Anyone can delete survey metadata" ON public.survey_metadata;

-- New authenticated-only policies for survey_metadata
CREATE POLICY "Authenticated users can view survey metadata"
ON public.survey_metadata FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert survey metadata"
ON public.survey_metadata FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey metadata"
ON public.survey_metadata FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey metadata"
ON public.survey_metadata FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));