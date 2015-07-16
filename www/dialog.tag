/* Copyright 2014-2015 Robert Schroll
 *
 * This file is part of Crosswords and is distributed under the terms
 * of the GPL. See the file LICENSE for full details.
 */
<overlay-dialog>
    <div>
        <h1>{ title }</h1>
        <div>
            <yield/>
        </div>
        <menu>
            <button onclick={ close }>{ buttonlabel }</button>
        </menu>
    </div>
    
    <script>
        var self = this;
        self.mixin("display");
        
        self.title = opts.title;
        self.buttonlabel = opts.buttonlabel;
        
        close() {
            self.update({ displayed: false });
            riot.route("dialog-closed");
        }
    </script>
</overlay-dialog>
