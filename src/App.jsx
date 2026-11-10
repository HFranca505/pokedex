
import './App.css'
import PokemonCard from './components/PokemonCard'
import { useEffect, useState, useRef } from 'react'

// Componente principal da aplicação
function App() {

  // Estados utilizados para guardar e atualizar informações da tela
  const [pokemons, setPokemons] = useState([])
  const [pesquisa, setPesquisa] = useState('')
  const [limite, setLimite] = useState(30)
  const [offset, setOffset] = useState(0)
  const [tipoSelecionado, setTipoSelecionado] = useState('')
  const [tipos, setTipos] = useState([])
  const [pokemonSelecionado, setPokemonSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Cria uma referência para a área de detalhes do Pokémon
  const detalhesRef = useRef(null)

  // Quando um Pokémon é selecionado, a página rola até seus detalhes
  useEffect(() => {
    if (pokemonSelecionado && detalhesRef.current) {
      detalhesRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [pokemonSelecionado])

  // Busca os Pokémon na API quando o limite ou o offset mudam
  useEffect(() => {

    // Função responsável por buscar os Pokémon
    async function buscarPokemons() {
      setCarregando(true)
      setErro('')

      try {
        // Faz uma requisição para a PokéAPI
        // limit define a quantidade e offset define onde a busca começa
        const resposta = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${limite}&offset=${offset}`
        )

        // Verifica se a resposta da API foi bem-sucedida
        if (!resposta.ok) {
          throw new Error('Erro ao buscar pokemon')
        }

        // Converte a resposta da API para um objeto JavaScript
        const dados = await resposta.json()

        // Busca os detalhes de cada Pokémon retornado pela API
        const detalhes = await Promise.all(
          dados.results.map(async (pokemon) => {

            // Busca os dados completos de cada Pokémon usando sua URL
            const respostaDetalhes = await fetch(pokemon.url)

            if (!respostaDetalhes.ok) {
              throw new Error('Erro ao buscar detalhes do Pokémon')
            }

            const dadosDetalhes = await respostaDetalhes.json()

            return dadosDetalhes
          })
        )

        // Atualiza a lista de Pokémon
        setPokemons((listaAnterior) => {

          // Evita adicionar Pokémon que já estão na lista
          const novosPokemons = detalhes.filter((pokemonNovo) =>
            !listaAnterior.some((pokemonExistente) =>
              pokemonExistente.id === pokemonNovo.id
            )
          )

          // Junta os Pokémon antigos com os novos
          return [...listaAnterior, ...novosPokemons]
        })

      } catch (erro) {
        // Exibe uma mensagem caso aconteça algum erro na busca
        setErro('Não foi possível carregar os Pokémon')

      } finally {
        // Finaliza o indicador de carregamento
        setCarregando(false)
      }
    }

    // Executa a função de busca
    buscarPokemons()

  }, [limite, offset])

  // Busca os tipos disponíveis na PokéAPI
  useEffect(() => {

    async function buscarTipos() {
      const resposta = await fetch('https://pokeapi.co/api/v2/type')
      const dados = await resposta.json()

      // Guarda os tipos recebidos da API
      setTipos(dados.results)
    }

    buscarTipos()

  }, [])

  // Filtra os Pokémon pelo nome digitado e pelo tipo selecionado
  const pokemonsFiltrados = pokemons.filter((pokemon) => {

    // Verifica se o nome do Pokémon corresponde à pesquisa
    const nomeCombina = pokemon.name.includes(pesquisa.toLowerCase())

    // Verifica se o Pokémon pertence ao tipo selecionado
    const tipoCombina =
      tipoSelecionado === '' ||
      pokemon.types.some((item) => item.type.name === tipoSelecionado)

    // O Pokémon precisa atender aos dois critérios
    return nomeCombina && tipoCombina
  })

  // Parte visual da aplicação
  return (
    <div className="container">

      <h1>Minha Pokédex</h1>

      {/* Campo utilizado para pesquisar Pokémon pelo nome */}
      <input
        type="text"
        placeholder="Pesquisar Pokémon..."
        value={pesquisa}
        onChange={(evento) => setPesquisa(evento.target.value)}
      />

      {/* Lista de tipos disponíveis para filtrar os Pokémon */}
      <select
        value={tipoSelecionado}
        onChange={(evento) => setTipoSelecionado(evento.target.value)}
      >
        <option value="">Todos os tipos</option>

        {tipos.map((tipo) => (
          <option key={tipo.name} value={tipo.name}>
            {tipo.name.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Exibe os detalhes quando um Pokémon é selecionado */}
      {pokemonSelecionado && (
        <div className="detalhes-pokemon" ref={detalhesRef}>

          <h2>{pokemonSelecionado.name.toUpperCase()}</h2>

          {/* Botão para fechar os detalhes */}
          <button onClick={() => setPokemonSelecionado(null)}>
            Fechar detalhes
          </button>

          {/* Imagem do Pokémon */}
          <img
            src={pokemonSelecionado.sprites.front_default}
            alt={pokemonSelecionado.name}
            width="150"
          />

          {/* Informações básicas */}
          <p>Altura: {pokemonSelecionado.height}</p>
          <p>Peso: {pokemonSelecionado.weight}</p>

          {/* Percorre a lista de habilidades do Pokémon */}
          <p>
            Habilidades: {pokemonSelecionado.abilities.map((item) => (
              item.ability.name + ' '
            ))}
          </p>

          {/* Exibe os atributos e seus valores */}
          <p>Atributos:</p>

          {pokemonSelecionado.stats.map((item) => (
            <p key={item.stat.name}>
              {item.stat.name}: {item.base_stat}
            </p>
          ))}

        </div>
      )}

      {/* Mensagem exibida enquanto os Pokémon estão sendo carregados */}
      {carregando && <p>Carregando Pokémon...</p>}

      {/* Mensagem exibida caso aconteça algum erro */}
      {erro && <p>{erro}</p>}

      {/* Lista os cartões dos Pokémon encontrados após a filtragem */}
      <div className="lista-pokemons">

        {pokemonsFiltrados.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            aoClicar={() => setPokemonSelecionado(pokemon)}
          />
        ))}

      </div>

      {/* Botão que carrega mais 30 Pokémon */}
      <button onClick={() => { setOffset(offset + 30) }}>
        Carregar mais...
      </button>
      
       {/* Mensagem exibida enquanto os Pokémon estão sendo carregados */}
      {carregando && <p>Carregando Pokémon...</p>}

    </div>
  )
}

// Permite utilizar o componente App em outros arquivos
export default App
