import { getSupabaseAdmin } from "./supabaseAdmin";

export const refreshAcademicRollups = async () => {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.rpc("refresh_academic_rollups");
  if (error) throw error;
};

export const parseGradeIds = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
    : [];
