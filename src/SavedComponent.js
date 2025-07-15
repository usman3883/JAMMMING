import React from "react";
import "./SavedComponent.css"
function SavedComponent(props) {
    return (
    <div className='savedDivItem'>
        <h4>{props.name}</h4>
        <p>{props.artists}</p>
        <button onClick={() => props.handleRemove(props.id)}>Remove from Playlist</button>
    </div>
    )
}

export default SavedComponent;