let canvas = null;
let ctx = null;
let polygons = null;
let moving = 'A';
let seed = 1;

function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function createPolygon(points, colors) {
    const edges = [];
    const axis = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = (i + 1) >= points.length 
            ? points[0]
            : points[i + 1];
        const ed = {
            x: b.x - a.x,
            y: b.y - a.y,
        };
        axis.push({
            point: { x: (a.x + b.x) /2, y: (a.y + b.y) / 2 },
            direction: { x: -ed.y, y: ed.x }
        });
        edges.push(ed);
    }

    const polygon = {};
    polygon.points = points;
    polygon.edges = edges;
    polygon.axis = axis;
    polygon.colors = colors;
    
    function offset(x, y) {
        for (let i = 0; i < polygon.points.length; i++) {
            polygon.points[i].x += x;
            polygon.points[i].y += y;
        }
        for (let i = 0; i < polygon.axis.length; i++) {
            polygon.axis[i].point.x += x;
            polygon.axis[i].point.y += y;
        }
    }
    polygon.offset = offset;

    function project(v) {
        let min = {x: 512, y: 512};
        let max = {x: -512, y: -512};
        for (let i = 0; i < polygon.points.length; i++) {
            const x = polygon.points[i].x;
            const y = polygon.points[i].y;
            // dot (u, v) / squaredMag(v) * v
            const dotUV = x * v.x + y * v.y;
            const squaredLength = v.x * v.x + v.y * v.y;
            const scalar = dotUV / squaredLength;
            const vec = {
                x: v.x * scalar,
                y: v.y * scalar,
            };
            if (vec.x < min.x) {
                min.x = vec.x;
            }
            if (vec.y < min.y) {
                min.y = vec.y;
            }
            if (vec.x > max.x) {
                max.x = vec.x;
            }
            if (vec.y > max.y) {
                max.y = vec.y;
            }
        }
        return {
            min: min,
            max: max
        };
    }
    polygon.project = project;

    return polygon;
}

function renderPolygon(polygon) {
    const colors = polygon.colors;
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors[0];
    ctx.beginPath();
    start = polygon.points[0];
    ctx.moveTo(start.x, start.y);
    for (let i = 0; i < polygon.points.length; i++) {
        const b = i + 1 === polygon.points.length
            ? polygon.points[0]
            : polygon.points[i + 1];
        ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    const projections = [];
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors[1];
    ctx.beginPath();
    for (let i = 0; i < polygon.axis.length; i++){
        const point = { x: 256, y: 256 };
        const dir = polygon.axis[i].direction;

        let translationX = 0;
        let translationY = 0;
        if (dir.x === 0) {
            ctx.moveTo(point.x, 0);
            ctx.lineTo(point.x, 512);
            translationX = point.x;
            translationY = 0;
        } else {
            // angular coeficient
            let a = dir.y / dir.x;
            // y = ax + b
            // b = y - ax
            const b = point.y - a * point.x;
            // y = ax + b
            const y0 = a * 0 + b;
            const y512 = a * 512 + b
            ctx.moveTo(0, y0);
            ctx.lineTo(512, y512);
            if (a === 0) {
                translationX = 0;
                translationY = point.y;
            }
        }

        const keys = Object.keys(polygons);
        for (k in keys) {
            if (polygons.hasOwnProperty(keys[k])) {
                const p = polygons[keys[k]];
                const projection = p.project(dir);
                const p1x = projection.min.x + translationX;
                const p1y = projection.min.y + translationY;
                const p2x = projection.max.x + translationX;
                const p2y = projection.max.y + translationY;
                projections.push(p1x, p1y, p2x, p2y);
            }
        }
    }
    ctx.stroke();
    ctx.strokeStyle = colors[2];
    ctx.beginPath();
    for (let i = 0; i < projections.length; i += 4) {
        const p1x = projections[i], p1y = projections[i + 1];
        const p2x = projections[i + 2], p2y = projections[i + 3];
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
    }
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('sat-canvas');
    if (canvas == undefined) {
        return;
    }
    ctx = canvas.getContext('2d');
    polygons = {
        polygonA: createPolygon([
            { x: 0, y: 0 },
            { x: 250, y: 0 },
            { x: 250, y: 250 },
            { x: 0, y: 250 },
        ], ['red', 'blue', 'green']),
        polygonB: createPolygon([
            { x: 100, y: 350 },
            { x: 350, y: 100 },
            { x: 350, y: 350 },
        ], ['purple', 'orange', 'black']),
    };

    function render() {
        ctx.clearRect (0, 0, 512, 512);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 512, 512);
        renderPolygon(polygons.polygonA);
        renderPolygon(polygons.polygonB);
    }

    render();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            polygons['polygon' + moving].offset(10, 0);
            render();
        }
        if (e.key === 'ArrowLeft') {
            polygons['polygon' + moving].offset(-10, 0);
            render();
        }
        if (e.key === 'ArrowDown') {
            polygons['polygon' + moving].offset(0, 10);
            render();
        }
        if (e.key === 'ArrowUp') {
            polygons['polygon' + moving].offset(0, -10);
            render();
        }
        if (e.key === ' ') {
            const keys = Object.keys(polygons);
            const ckey = 'polygon' + moving;
            let idx = keys.indexOf(ckey) + 1;
            if (idx >= keys.length) {
                idx = 0;
            }
            moving = keys[idx].replace('polygon', '');
        }
    });
});