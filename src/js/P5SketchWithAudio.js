import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import blobshape from "blobshape";
import { TriadicColourCalculator } from './functions/ColourCalculators';
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/blobs-no-1.ogg";
import midi from "../audio/blobs-no-1.mid";

/**
 * Inspiration:
 * 
 * https://github.com/lokesh-coder/blobshape/
 * https://github.com/nghiepdev/react-svg-blob/tree/main
 * https://codepen.io/Dillo/pen/KKrjKpa?editors=0010
 * https://dev.to/georgedoescode/a-generative-svg-starter-kit-5cm1
 * 
 */
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
                    const noteSet1 = result.tracks[2].notes; // Synth 1 - Init Patch
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

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.colorMode(p.HSB);
            p.strokeWeight(2);
            p.noLoop();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.drawBlob = (x, y, size, growth, edges, color) => {
            const { path } = blobshape({ size: size, growth: growth, edges: edges, seed: 1 });
            const pathArray = p.parseSVGPath(path);
            p.translate(x - (size / 2), y - (size / 2));
            p.fill(
                color._getHue(),
                100,
                100,
                0.5
            );
            p.stroke(
                color._getHue(),
                100,
                100,
                1
            );
            p.beginShape();
            for (let cmd of pathArray) {
                let command = cmd[0];
                let params = cmd.slice(1);
                
                if (command === 'M') {
                    p.vertex(params[0], params[1]);
                } else if (command === 'Q') {
                    p.quadraticVertex(params[0], params[1], params[2], params[3]);
                }
            }
            p.endShape(p.CLOSE);
            p.translate(-x + (size / 2), -y + (size / 2));
        }

        p.parseSVGPath = (pathData) => {
            let commands = pathData.match(/[a-df-z][^a-df-z]*/gi);
            let pathArray = [];
            
            for (let cmd of commands) {
                let command = cmd.charAt(0);
                let params = cmd.slice(1).split(/[\s,]+/).map(Number);
                pathArray.push([command, ...params]);
            }
            
            return pathArray;
        }

        p.sizes = [8, 12, 16, 24, 32, 48, 64];

        p.blobsArray = [];

        p.executeCueSet1 = (note) => {
            const { duration } = note;
            p.blobsArray = [];
            p.background(0);

            const divisor = p.random(p.sizes);
            console.log(divisor);
            for (let x = 0; x <= p.width; x = x + (p.width / divisor)) {
                for (let y = 0; y <= (p.height + (p.width / divisor)); y = y + (p.width / divisor)) {
                    const hue = p.random(0, 360);
                    p.blobsArray.push({
                        x: x,
                        y: y,
                        growth: parseInt(p.random(3, 9)),
                        edges: parseInt(p.random(4, 16)),
                        colourSet: TriadicColourCalculator(p, hue),
                        divisor: divisor
                    });
                    
                    
                }  
            }

            p.blobsArray = p.shuffle(p.blobsArray);
            const delay = (duration * 1000 / p.blobsArray.length);
            for (let i = 0; i < p.blobsArray.length; i++) {
                const blob = p.blobsArray[i];
                const { x, y, growth, edges, colourSet } = blob;

                setTimeout(
                    function () {
                        p.drawBlob(x, y, (p.width / (divisor * 0.9)), growth, edges, colourSet[0]);
                        p.drawBlob(x, y, (p.width / (divisor * 1.2)), growth, edges, colourSet[1]);
                        p.drawBlob(x, y, (p.width / (divisor * 1.5)), growth, edges, colourSet[2]);
                    },
                    (delay * i)
                );
            }
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
