

# template Js

## Overview

## Purpose 

Something super light that will decouple action, binding and view render. 


## Example

```html
<button class='user-load' data-id='1'>Show user id: 1</div>
<button class='user-load' data-id='2'>Show user id: 2</div>
<button class='user-load-none' >None</div>

<div class='user-widget'> </div>
```

```javascript 

const app = new TemplateJS()

//view + binding

app.click(".user-load", "user-show-action")
app.click(".user-load-none", "user-load-none")

app.view("user-widget", ".user-widget", 
    "<h2>:username</h2> <div>:userDesc</div>")

// action
app.action("user-show-action", async ({id})=>{
    const user = {name: "John Tribe", desc: "Some Desc"}
    // const user = (await fetch("/..../"+id)).json()

    app.render("user-widget", {
        username: user.name, 
        userDesc: user.desc
    })
})

app.action("user-load-none", async ()=>{
    app.render("user-widget", {
        username: "None", 
        userDesc: "None"
    })
})

```




