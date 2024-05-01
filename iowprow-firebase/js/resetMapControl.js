
class ResetMapControl {

    constructor(options) {
        this.options = Object.assign({
            resetLngLat: null, // LatLng or LatLngLike
            resetZoom: 1, // number, zoom level; useful only with resetLngLat
            tooltipText: "Reset map view",
        }, options);

        if (!this.options.resetLngLat) throw new Error('ResetMapControl requires resetLngLat');
    }

    onAdd(map) {
        this._map = map;

        this._resetButton = document.createElement('button');
        this._resetButton.className = 'maplibregl-ctrl-reset';
        this._resetButton.type = 'button';
        this._resetButton.title = 'Reset map';
        this._resetButton.onclick = () => this._resetMap();


        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
        this._container.appendChild(this._resetButton);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    _resetMap() {

        // if (this._map.getLayer("locationLine")) {
        //      console.log("has layer");
        //  }

        this._map.setZoom(this.options.resetZoom).setCenter(this.options.resetLngLat);
    }

}