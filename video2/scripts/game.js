const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const polygons = [];

polygons.push(createPolygon([
    { x: 50, y: 50 },
    { x: 100, y: 50 },
    { x: 100, y: 150 },
    { x: 50, y: 150 },
], 'red', {
    type: 'player'
}));

polygons.push(createPolygon([
    { x: 150, y: 100 },
    { x: 100, y: 200 },
    { x: 200, y: 200 },
], 'blue', {
    type: 'map'
}));

function render() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    polygons.forEach((polygon) => {
        polygon.render(context);
    });
}
render();

function testCollision() {
    for (let i = 1; i < polygons.length; i += 1) {
        if (polygons[0].testWith(polygons[i])) {
            console.log("True with: ", polygons[i].data.type);
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        polygons[0].offset(-10, 0);
        testCollision();
        render();
    } else if (e.key === 'ArrowRight') {
        polygons[0].offset(10, 0);
        testCollision();
        render();
    } else if (e.key === 'ArrowDown') {
        polygons[0].offset(0, 10);
        testCollision();
        render();
    } else if (e.key === 'ArrowUp') {
        polygons[0].offset(0, -10);
        testCollision();
        render();
    }
});
