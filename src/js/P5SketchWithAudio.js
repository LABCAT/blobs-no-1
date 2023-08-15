import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import { TetradicColourCalculator } from './functions/ColourCalculators';
import PlayIcon from './functions/PlayIcon.js';
import SaveJSONToFile from './functions/SaveJSONToFile.js';
import Diamond from './classes/Diamond.js';

import audio from "../audio/blobs-no-1.ogg";
import midi from "../audio/blobs-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[13].notes; // Subtrator 1 - Hyperbottom
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.xSize = 0;

        p.ySize = 0;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.colorMode(p.HSB);
            p.cells = require('../json/grid-64x64.json');
            p.xSize = p.height / p.random([64, 48]);
            p.ySize = p.width / p.random([64, 48]);
            p.noFill();
            p.strokeWeight(4);
            p.noLoop();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.cells = [];

        p.generateCells = () => {
            let loopIndex = 1;
            for (let i = 0; i <= 64; i++) {
                for (let x = -i; x < i; x++) {
                    for (let y = -i; y < i; y++) {

                        const key = x + '-' + y;
                        if (! p.cells.some(r => r.key === key)) {
                            p.cells.push(
                                {
                                    key: key,
                                    x: x,
                                    y: y,
                                    loopIndex: loopIndex
                                }
                            );
                        }
                        
                    }
                }
                loopIndex++;
            }
            SaveJSONToFile(p.cells, 'grid.json');
        }

        p.startingPositions = [
            {
                x: 1,
                y: 1
            },
            {
                x: 1,
                y: 3
            },
            {
                x: 3,
                y: 1
            },
            {
                x: 3,
                y: 3
            },
        ];


        p.executeCueSet1 = (note) => {

            const { currentCue, duration } = note;
            p.background(0);
            if(currentCue % 4 === 1){
                p.startingPositions = p.shuffle(p.startingPositions);
                p.bigDiamonds = [];
                p.smallDiamonds = [];
            }

            

            p.xSize = p.height / p.random([80, 64, 32, 16, 8]) / 4;
            p.ySize = p.width / p.random([80, 64, 32, 16, 8]) / 4;

            p.lines = [];

            const baseHue = p.random(0, 360);
            let colours = [];

            p.strokeWeight(p.random([2,3,4]));

            for (let i = 0; i < 32; i++) {
                
                
                if(i > 0) {
                    colours = TetradicColourCalculator(p, baseHue, 50 + 50 / 32 * i, 100 - 64 / 32 * i);
                    const numberOfLines = i * 2 + 1;
                    // connecting cell and top left

                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = j === numberOfLines ? p.xSize * (j - 2) * -1 : p.xSize * j * -1,
                            y1 = p.ySize * (j - numberOfLines),
                            x2 = p.xSize  * (j - 1)* -1, 
                            y2 = p.ySize * (j - 1 - numberOfLines);
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                            strokeColor: colours[0]
                        });
                    }
                    
                    //top right
                    
                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = p.xSize * (j - 1),
                            y1 = p.ySize * (j - 1 - numberOfLines),
                            x2 = p.xSize * j, 
                            y2 = p.ySize * (j - numberOfLines);
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                            strokeColor: colours[1]
                        });
                    }

                    // bottom right
                    for (let j = 1; j <= numberOfLines; j++) {
                        const x1 = p.xSize * j,
                            y1 = p.ySize * (j - numberOfLines) * -1,
                            x2 = p.xSize  * (j - 1), 
                            y2 = p.ySize * (j - 1 - numberOfLines) * -1;
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                            strokeColor: colours[2]
                        });
                    }

                    // bottom left
                    for (let j = 1; j <= numberOfLines; j++) {
                            const x1 = p.xSize * (j - 1) * -1,
                            y1 = p.ySize * (j - 1 - numberOfLines) * -1,
                            x2 = p.xSize * j * -1, 
                            y2 = p.ySize * (j - numberOfLines) * -1;
                        p.lines.push({
                            x1: x1,
                            y1: y1,
                            x2: x2,
                            y2: y2,
                            strokeColor: colours[3]
                        });
                    }
                }
                else {
                    // top right
                    p.lines.push({
                        x1: p.xSize * 0,
                        y1: p.ySize * -1,
                        x2: p.xSize * 1,
                        y2: p.ySize * 0,
                        strokeColor: p.color(p.random(0,255), p.random(0,255), p.random(0,255))
                    })
                    // bottom right
                    p.lines.push({
                        x1: p.xSize * 1,
                        y1: p.ySize * 0,
                        x2: p.xSize * 0,
                        y2: p.ySize * 1,
                        strokeColor: p.color(p.random(0,255), p.random(0,255), p.random(0,255))
                    });
                    // bottom left
                    p.lines.push({
                        x1: p.xSize * 0,
                        y1: p.ySize * 1,
                        x2: p.xSize * -1,
                        y2: p.ySize * 0,
                        strokeColor: p.color(p.random(0,255), p.random(0,255), p.random(0,255))
                    });
                }
            }

            const diamondIndex = currentCue % 4 ? currentCue % 4 - 1 : 3; 
            p.bigDiamonds[diamondIndex] = p.lines;

            p.bigDiamonds.forEach((diamond, index) => {
                const lines = diamond, 
                    startingPos = p.startingPositions[index],
                    { x, y } = startingPos,
                    startX = p.width / 4 * x,
                    startY = p.height / 4 * y;

                const delay = (duration * 1000 / lines.length) * 0.5;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i],
                        { x1, y1, x2, y2, strokeColor } = line;
                    

                    setTimeout(
                        function () {
                            p.translate(startX, startY);
                            p.stroke(strokeColor);
                            p.line(x1,y1,x2,y2);
                            p.translate(-startX, -startY);
                        },
                        (delay * i)
                    );
                    
                }
            });
        }

        p.currentMidi = 0;

        p.sizeAdjuster = 3;

        p.executeCueSet2 = (note) => {
            const { currentCue, midi } = note;
            p.sizeAdjuster = p.currentMidi === midi ? p.sizeAdjuster - 1 : 3;
            p.currentMidi = midi;
            const positions = [
                {
                    x: 7,
                    y: 4
                },
                {
                    x: 4,
                    y: 7
                },
                {
                    x: 1,
                    y: 4
                },
                {
                    x: 4,
                    y: 1
                },
            ];

            const location = [62, 59, 57, 60].indexOf(midi)

            p.smallDiamonds.push(
                new Diamond(
                    p,
                    p.width / 8 * positions[location].x,
                    p.height / 8  * positions[location].y,
                    p.random(0, 360),
                    p.width / 2 * p.sizeAdjuster, 
                    100, 
                    0
                )
            );
            

            p.smallDiamonds.forEach((diamond) => {
                diamond.draw();
            });
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
