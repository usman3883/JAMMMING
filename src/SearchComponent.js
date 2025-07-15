import React from 'react';
import "./SearchComponent.css"
function SearchComponent(props) {
    return (
        <div className='searchDivItem'>
            <h4>{props.name}</h4>
            <p>{props.artists}</p>
        </div>
    )
}

export default SearchComponent;