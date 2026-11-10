
function PokemonCard(props) {

  return (
    <div className="card" onClick={props.aoClicar}>
      <h3>{props.pokemon.name.toUpperCase()}</h3>

      <p>Número: {props.pokemon.id}</p>

      <p>Tipo: {props.pokemon.types.map((item) =>(
        item.type.name.toUpperCase() + ' '
      ))}
      </p>

      <img
        src={props.pokemon.sprites.front_default}
        alt={props.pokemon.name}
        width="120"
      />

    </div>
  )

}

export default PokemonCard
