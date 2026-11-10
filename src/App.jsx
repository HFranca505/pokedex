
import './App.css'
import PokemonCard from './components/PokemonCard'
import { useEffect, useState, useRef } from 'react'

function App() {

  const [pokemons, setPokemons] = useState([])
  const [pesquisa, setPesquisa] = useState('')
  const [limite, setLimite] = useState(30)
  const [offset, setOffset] = useState(0)
  const [tipoSelecionado, setTipoSelecionado] = useState('')
  const [tipos, setTipos] = useState([])
  const [pokemonSelecionado, setPokemonSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const detalhesRef = useRef(null)

  useEffect(() => {
    if (pokemonSelecionado && detalhesRef.current) {
      detalhesRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [pokemonSelecionado])

  useEffect(() => {

    async function buscarPokemons() {
      setCarregando(true)
      setErro('')

      try{
        const resposta = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limite}&offset=${offset}`
      )

      if (!resposta.ok){
          throw new Error('Erro ao buscar pokemon')
        }

        const dados = await resposta.json()

         const detalhes = await Promise.all(
        dados.results.map(async (pokemon) => {

          const respostaDetalhes = await fetch(pokemon.url)
          if (!respostaDetalhes.ok){
            throw new Error('Erro ao buscar detalhes do Pokémon');
          }

          const dadosDetalhes = await respostaDetalhes.json()

          return dadosDetalhes

        })
      )

      setPokemons((listaAnterior) => {
        const novosPokemons = detalhes.filter((pokemonNovo) =>
          !listaAnterior.some((pokemonExistente) =>
          pokemonExistente.id === pokemonNovo.id
          )
        )

        return [...listaAnterior, ...novosPokemons]
      })
      } catch (erro){
        setErro('Não foi possível carregar os Pokémon')
      } finally {
        setCarregando(false)
      }
    }

    buscarPokemons()

  }, [limite, offset])

  useEffect(() => {
    async function buscarTipos() {
      const resposta = await fetch('https://pokeapi.co/api/v2/type')
      const dados = await resposta.json()

      setTipos(dados.results)
  }

    buscarTipos()
  }, [])

  const pokemonsFiltrados = pokemons.filter((pokemon) =>{
    const nomeCombina = pokemon.name.includes(pesquisa.toLowerCase())

    const tipoCombina = 
      tipoSelecionado === '' ||
      pokemon.types.some((item) => item.type.name === tipoSelecionado)

    return nomeCombina && tipoCombina
  })

  return (
    <div className="container">
      <h1>Minha Pokédex</h1>

      <input
        type="text"
        placeholder="Pesquisar Pokémon..."
        value={pesquisa}
        onChange={(evento) => setPesquisa(evento.target.value)}
      />

      <select
        value={tipoSelecionado}
        onChange={(evento) =>setTipoSelecionado(evento.target.value)}
      >
        <option value="">Todos os tipos</option>

        {tipos.map((tipo)=> (
          <option key={tipo.name} value={tipo.name}>
            {tipo.name.toUpperCase()}
          </option>
        ))}
      </select>

      {pokemonSelecionado && (
        <div className="detalhes-pokemon" ref={detalhesRef}>
          <h2>{pokemonSelecionado.name.toUpperCase()}</h2>

          <button onClick={() => setPokemonSelecionado(null)}>
            Fechar detalhes
          </button>

          <img
            src={pokemonSelecionado.sprites.front_default}
            alt={pokemonSelecionado.name}
            width="150"
          />

          <p>Altura: {pokemonSelecionado.height}</p>

          <p>Peso: {pokemonSelecionado.weight}</p>

          <p>Habilidades: {pokemonSelecionado.abilities.map((item) => (
            item.ability.name + ' '
          ))}
          </p>

          <p>Atributos:</p>

          {pokemonSelecionado.stats.map((item) => (
            <p key={item.stat.name}>
              {item.stat.name}: {item.base_stat}
            </p>
          ))}

        </div>
      )}

      {carregando && <p>Carregando Pokémon...</p>}

      {erro && <p>{erro}</p>}

      <div className="lista-pokemons">
        {pokemonsFiltrados.map((pokemon) => (
        <PokemonCard 
          key={pokemon.id}   
          pokemon={pokemon}
          aoClicar={() => setPokemonSelecionado(pokemon)}
          />
      ))}
      </div>

      <button onClick={() =>{ setOffset(offset + 30)}}>
        Carregar mais...
      </button>

    </div>
  )
}

export default App
