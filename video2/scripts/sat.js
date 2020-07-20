function buildEdges(vertices) {
    const edges = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const a = vertices[i];
        let b = vertices[0];
        if (i + 1 < vertices.length) {
            b = vertices[i + 1];
        }
        edges.push({
            x: b.x - a.x,
            y: b.y - a.y,
        });
    }
    return edges;
}

function intervalDistance(minA, maxA, minB, maxB) {
    if (minB < minA) {
        return minA - maxB;
    }
    return minB - maxA;
}

function createPolygon(vertices, color, data) {
    const polygon = {};
    polygon.vertices = vertices;
    polygon.edges = buildEdges(vertices);
    polygon.data = data;
    polygon.color = color;

    polygon.projectInAxis = function(x, y) {
        let min = 10000;
        let max = -10000;
        const len = Math.sqrt(x * x + y * y);
        for (let i = 0; i < polygon.vertices.length; i += 1) {
            // produto escalar de polygon.vertices[i] por (x, y)
            // dividido pelo modulo de (x, y)
            const proj = (polygon.vertices[i].x * x + polygon.vertices[i].y * y) / len;
            if (proj > max) {
                max = proj;
            }
            if (proj < min) {
                min = proj;
            }
        }
        return {
            min: min,
            max: max,
        };
    }

    polygon.testWith = function(otherPolygon) {
        const axis = [];
        for (let i = 0; i < polygon.edges.length; i += 1) {
            axis.push({
                x: -polygon.edges[i].y,
                y: polygon.edges[i].x
            });
        }
        for (let i = 0; i < otherPolygon.edges.length; i += 1) {
            axis.push({
                x: -otherPolygon.edges[i].y,
                y: otherPolygon.edges[i].x
            });
        }
        for (let i = 0; i < axis.length; i += 1) {
            const proj1 = polygon.projectInAxis(axis[i].x, axis[i].y);
            const proj2 = otherPolygon.projectInAxis(axis[i].x, axis[i].y);
            const dist = intervalDistance(proj1.min, proj1.max, proj2.min, proj2.max);
            if (dist > 0) {
                return false;
            }
        }
        return true;
    }

    polygon.render = function(context) {
        if (polygon.vertices.length < 3) {
            return;
        }
        context.beginPath();
        context.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);
        for (let i = 1; i < polygon.vertices.length; i += 1) {
            context.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
        }
        context.closePath();
        context.strokeStyle = polygon.color;
        context.stroke();
    }

    polygon.offset = function(x, y) {
        for (let i = 0; i < polygon.vertices.length; i += 1) {
            polygon.vertices[i] = {
                x: polygon.vertices[i].x + x,
                y: polygon.vertices[i].y + y,
            };
        }
    }

    return polygon;
}
