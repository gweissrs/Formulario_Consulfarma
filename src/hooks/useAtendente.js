import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAtendente() {
  const [atendentes, setAtendentes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function buscarAtendentes() {
      try {
        const { data, error } = await supabase
          .from('atendentes')
          .select('*')
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        setAtendentes(data || [])
      } catch (err) {
        setErro(err.message)
        // Fallback com lista fixa para garantir funcionamento offline
        setAtendentes([
          { id: 'thiago', nome: 'Thiago' },
          { id: 'leila', nome: 'Leila' },
          { id: 'flavia', nome: 'Flavia' },
          { id: 'francine', nome: 'Francine' },
          { id: 'edna', nome: 'Edna' },
          { id: 'jean', nome: 'Jean' },
        ])
      } finally {
        setCarregando(false)
      }
    }

    buscarAtendentes()
  }, [])

  return { atendentes, carregando, erro }
}
