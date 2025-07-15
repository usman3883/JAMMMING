import React from 'react';
import "./SearchComponent.css"
function SearchComponent(props) {
    return (
        <div className='searchDivItem'>
            <h4>{props.name}</h4>
            <p>{props.artists}</p>
            <button onClick={() => {
                props.handleAddPlaylist({
                    name:props.name,
                    id:props.id,
                    artists:props.artists
                })
            }}>Add to Playlist</button>
        </div>
    )
}

export default SearchComponent;