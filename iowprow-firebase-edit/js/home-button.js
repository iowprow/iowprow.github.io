
class ResetMapControl {
    onAdd(map) {
        this._map = map;

        this._myButton = document.createElement('button');
        this._myButton.className = 'maplibregl-ctrl-reset';
        this._myButton.type = 'button';
        this._myButton.title = 'Reset map';
        this._myButton.onclick = () => this._resetMap();


        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        //  this._container.innerHTML = '<button><span class="mapboxgl-ctrl-icon my-image-button" aria-hidden="true" title="Description">Hello</span></button>';
        this._container.appendChild(this._myButton);


        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    _resetMap() {
        const map = this._map;
        console.log(this._map);
        map.zoomIn();
        // map.setZoom(10).setCenter(homePosition.center);

    }

}