customElements.define('sidebar-component',
    class Sidebar extends HTMLElement {

        constructor() {
            super()
        }

        connectedCallback() {
            // which menu
            let menu;
            const menu_legend = "legend";
            const menu_admin = "admin";

            if (this.hasAttribute("showMenu")) {
                //  console.log("has attribute");
                let menuValue = this.getAttribute("showMenu");
                menuValue === "legend" ? menu = menu_legend : "";
                menuValue === "admin" ? menu = menu_admin : "";
            } else {
                //   console.log("NO attribute");
                menu = menu_legend;
            }

            // console.log("menu = " + menu);

            if (menu === 'admin') {
                this.renderAdmin();
            } else {
                this.renderLegend();
            }

            //  console.log("sidebar rendering");
        }

        renderLegend() {
            this.innerHTML = `
                <style>
                    /* sidebar */
                    .rounded-rect {
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 0 50px -25px black;
                    }
            
                    .flex-center {
                        position: absolute;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                    }
            
                    .flex-center.left {
                        left: 0px;
                    }
            
                    .sidebar-content {
                        position: absolute;
                        width: 95%;
                        /*  height: 90%;*/
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 16px;
                        color: gray;
                    }
            
                    .sidebar-toggle {
                        position: absolute;
                        width: 2em;
                        height: 1.6em;
                        overflow: visible;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: #fed330;
                    }
            
                    .sidebar-toggle.left {
                        right: -3em;
                        top: 0;
                    }
            
                    .sidebar-toggle:hover {
                        color: #0aa1cf;
                        cursor: pointer;
                    }
            
                    .sidebar {
                        transition: transform 1s;
                        z-index: 1;
                        width: 180px;
                        height: 100%;
                        top: 1.5em;
                    }
            
                    .left.collapsed {
                        transform: translateX(-195px);
                    }
            
                    /* END sidebar */

                    /*	Legend	*/
                #legend {
                    margin-top: 1em;
                }

                input#Footpath {
                    accent-color: red;
                    transition: accent-color 0.5s 0.2s ease;
                    cursor: pointer;
                }

                input#Bridleway {
                    accent-color: blue;
                    transition: accent-color 0.5s 0.2s ease;
                    cursor: pointer;
                }

                input#BOAT {
                    accent-color: orange;
                    transition: accent-color 0.5s 0.2s ease;
                    cursor: pointer;
                }

                input#Boundaries {
                    accent-color: black;
                    transition: accent-color 0.5s 0.2s ease;
                    cursor: pointer;
                }

                .switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 17px;
                    margin: 5px 0px 5px 0px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #93cdfc;
                    -webkit-transition: .4s;
                    transition: .4s;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 1px;
                    bottom: 1px;
                    background-color: white;
                    -webkit-transition: .4s;
                    transition: .4s;
                }

                input:checked+.slider {
                    background-color: #2196F3;
                }

                input:focus+.slider {
                    box-shadow: 0 0 1px #2196F3;
                }

                input:checked+.slider:before {
                    -webkit-transform: translateX(26px);
                    -ms-transform: translateX(26px);
                    transform: translateX(26px);
                }

                /* Rounded sliders */
                .slider.round {
                    border-radius: 34px;
                }

                .slider.round:before {
                    border-radius: 50%;
                }

                .slider::after {
                    position: relative;
                    right: -50px;
                    content: "Show/Hide"
                }

                /*	END Legend	*/
            </style>    
            <sidebar>
                <div id="left" class="sidebar flex-center left collapsed">
                    <div class="sidebar-content rounded-rect flex-center">
                        <div id="sidebarMenu">
                            <div id="legend">
                                <nav id="filter-prow" class="filter-parish">
                                    <div>
                                        <input type="checkbox" class="viewProwType" id="Footpath" checked>
                                        <label for="Footpath">Footpath</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" class="viewProwType" id="Bridleway" checked>
                                        <label for="Bridleway">Bridleway</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" class="viewProwType" id="BOAT" checked>
                                        <label for="BOAT">Byways</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" class="viewProwType" id="Boundaries" checked>
                                        <label for="Boundaries">Parish boundaries</label>
                                    </div>
                                </nav>
                                <nav id="filter-parish" class="filter-parish">
                                    <label class="switch"><input type="checkbox" id="showAll" checked=""><span class="slider round"></span></label>
                                    <div><input type="checkbox" class="viewParish" id="parish-A" checked><label for="parish-A">Arreton</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-B" checked><label for="parish-B">Brading</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-BB" checked><label for="parish-BB">Bembridge</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-BS" checked><label for="parish-BS">Brighstone</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-C" checked><label for="parish-C">Chale</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-CB" checked><label for="parish-CB">Calbourne</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-CS" checked><label for="parish-CS">Cowes</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-F" checked><label for="parish-F">Freshwater</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-G" checked><label for="parish-G">Gatcombe</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-GL" checked><label for="parish-GL">Godshill</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-N" checked><label for="parish-N">Newport</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-NC" checked><label for="parish-NC">Newchurch</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-NT" checked><label for="parish-NT">Niton</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-R" checked><label for="parish-R">Ryde</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-S" checked><label for="parish-S">Shalfleet</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-SS" checked><label for="parish-SS">Sandown/Shanklin</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-SW" checked><label for="parish-SW">Shorwell</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-T" checked><label for="parish-T">Totland</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-V" checked><label for="parish-V">Ventnor</label></div>
                                    <div><input type="checkbox" class="viewParish" id="parish-Y" checked><label for="parish-Y">Yarmouth</label></div>
                                </nav>
                            </div>
                        </div>
                        <div class="sidebar-toggle rounded-rect left" id="leftSidebar">&rarr;</div>
                    </div>
                </div>
            <sidebar>
            `
        }


        renderAdmin() {
            this.innerHTML = `
                <style>
                    /* sidebar */
                    .rounded-rect {
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 0 50px -25px black;
                    }
            
                    .flex-center {
                        position: absolute;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                    }
            
                    .flex-center.left {
                        left: 0px;
                    }
            
                    .sidebar-content {
                        position: absolute;
                        width: 95%;
                        /*  height: 90%;*/
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 16px;
                        color: gray;
                    }
            
                    .sidebar-toggle {
                        position: absolute;
                        width: 2em;
                        height: 1.6em;
                        overflow: visible;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: #fed330;
                    }
            
                    .sidebar-toggle.left {
                        right: -3em;
                        top: 0;
                    }
            
                    .sidebar-toggle:hover {
                        color: #0aa1cf;
                        cursor: pointer;
                    }
            
                    .sidebar {
                        transition: transform 1s;
                        z-index: 1;
                        width: 180px;
                        height: 100%;
                        top: 1.5em;
                    }
            
                    .left.collapsed {
                        transform: translateX(-195px);
                    }
            
                    /* END sidebar */
                
            </style>    
            <sidebar>
                <div id="left" class="sidebar flex-center left collapsed">
                    <div class="sidebar-content rounded-rect flex-center">
                        <div id="sidebarMenu">
                            <div id="adminMenu">
                                <nav id="adminList">
                                    <ul>
                                        <li>Test1</li>
                                        <li>Test2</li>
                                        <li>Test3</li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div class="sidebar-toggle rounded-rect left" id="leftSidebar">&rarr;</div>
                    </div>
                </div>
            <sidebar>
            `
        }
    }
)
