// registrosService.js
import supabase from "./supabaseClient.js";

export async function criarRegistro(turnoId, placa, prisma) {
  const { data, error } = await supabase
    .from("registros")
    .insert([{
      turno_id: turnoId,
      placa,
      prisma,
      status: "na_garagem",
      entrada: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar registro:", error);
    return null;
  }

  return data;
}

export async function buscarRegistrosDoTurno(turnoId) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("turno_id", turnoId)
    .order("entrada", { ascending: false });

  if (error) {
    console.error("Erro ao buscar registros:", error);
    return [];
  }

  return data;
}

export async function marcarSaidaRegistro(id) {
  const { error } = await supabase
    .from("registros")
    .update({
      status: "saiu",
      saida: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao marcar saída:", error);
  }
}

export async function excluirRegistroBanco(id) {
  const { error } = await supabase
    .from("registros")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir registro:", error);
  }
}


export async function buscarTodosRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar registros:", error);
    return [];
  }

  return data;
}
