const jsonfile = require('jsonfile');
const file = 'data.json'
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
const methodOverride = require('method-override')
app.use(methodOverride('_method'));
const reactEngine = require('express-react-views').createEngine();
app.engine('jsx', reactEngine);
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.use(express.static(__dirname + '/public/'));

app.get('/', (req, res) => {
    res.redirect('/recipes');
})

app.get('/recipes', (req, res) => {
    jsonfile.readFile(file, (err, obj) => {
        if (req.query.something) {
            var listOfDish = [];
            for(i=0;i<obj.recipe.length;i++){
                let arr = Object.values(obj.recipe[i]);
                for(j=0;j<4;j++){
                    if(arr[j].includes(req.query.something)){
                        listOfDish.push(obj.recipe[i]);
                        break;
                    }
                }
            }

            let data = {
                title: req.query.something,
                recipe: listOfDish,
                ori:obj.recipe
            }
            res.render('selective',data);
        } else {
            let arr = obj.recipe.slice().sort((a, b) => (a.title > b.title) ? 1 : -1)
            let data = {
                title: "Home",
                recipe: arr

            }
            res.render('home', data);
        }



    })
})

app.get('/recipes/new', (req, res) => {
    let data = {
        title: "Adding Recipe"
    }
    res.render('add');
})

app.post('/recipes', (req, res) => {

    jsonfile.readFile(file, (err, obj) => {
        if (req.body.utensils) {
            req.body.utensils = req.body.utensils.split(",");
        } else {
            req.body.utensils = []
        }
        if (req.body.seasonings) {
            req.body.seasonings = req.body.seasonings.split(",");
        } else {
            req.body.seasonings = [];
        }

        if (req.body.ingredients) {
            req.body.ingredients = req.body.ingredients.split(",");
        } else {
            req.body.ingredients = [];
        }

        obj.recipe.push(req.body);

        jsonfile.writeFile(file, obj, (err) => {
            res.redirect(`/recipes/${obj.recipe.length}`);
        });
    });
})

app.get('/recipes/:id', (req, res) => {
    let id = parseInt(req.params.id);

    if (isNaN(id)) {
        res.send("bad input")
    } else {
        jsonfile.readFile(file, (err, obj) => {
            let data = {
                title: obj.recipe[id - 1].title,
                item: obj.recipe[id - 1],
                id: id
            }
            res.render('individual', data)


        });
    }


})

app.get('/recipes/:id/edit', (req, res) => {

    let id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.send("bad input")
    } else {
        jsonfile.readFile(file, (err, obj) => {
            let data = {
                title: obj.recipe[id - 1].title,
                item: obj.recipe[id - 1],
                id: id
            }
            res.render('edit', data)


        });
    }
})

app.put('/recipes/:id', (req, res) => {
    let id = parseInt(req.params.id);

    jsonfile.readFile(file, (err, obj) => {
        req.body.utensils = req.body.utensils.split(",");
        req.body.seasonings = req.body.seasonings.split(",");
        req.body.ingredients = req.body.ingredients.split(",");

        obj.recipe[id - 1] = req.body;

        jsonfile.writeFile(file, obj, (err) => {
            res.redirect(`/recipes/${id}`);
        });
    });

})

app.get('/recipes/:id/delete', (req, res) => {

    let id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.send("bad input")
    } else {
        jsonfile.readFile(file, (err, obj) => {
            let data = {
                title: obj.recipe[id - 1].title,
                item: obj.recipe[id - 1],
                id: id
            }
            res.render('delete', data);


        });
    }
})

app.delete('/recipes/:id', (req, res) => {
    let id = parseInt(req.params.id);
    jsonfile.readFile(file, (err, obj) => {

        obj.recipe.splice(id - 1, 1);

        jsonfile.writeFile(file, obj, (err) => {
            res.redirect(`/recipes`);
        });
    });
})



app.listen(3000)