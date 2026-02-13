// turnosService.js
import supabase from "./supabaseClient.js";

export async function criarTurno() {
  const { data, error } = await supabase
    .from("turnos")
    .insert([
      {
        status: "aberto",
        data_inicio: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar turno:", error);
    return null;
  }

  return data;
}

export async function buscarTurnoAberto() {
  const { data, error } = await supabase
    .from("turnos")
    .select("*")
    .eq("status", "aberto")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar turno:", error);
    return null;
  }

  return data;
}

export async function encerrarTurno(turnoId) {
  const { data, error } = await supabase
    .from("turnos")
    .update({
      status: "encerrado",
      data_fim: new Date().toISOString()
    })
    .eq("id", turnoId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao encerrar turno:", error);
    return null;
  }

  return data;
}

export async function buscarTurnosEncerrados() {
  const { data, error } = await supabase
    .from("turnos")
    .select("*")
    .eq("status", "encerrado")
    .order("data_fim", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  return data;
}

