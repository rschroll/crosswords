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
        }
    </script>
</overlay-dialog>
