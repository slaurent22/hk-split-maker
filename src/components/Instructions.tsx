import type { ReactNode } from "react";
import React, { Component } from "react";

const VIDEO_URL = "https://www.youtube.com/watch?v=JBdm7LvZAZQ";

export default class Instructions extends Component {
    public render(): ReactNode {
        return (
            <div id="instructions">
                <h2>Instructions</h2>
                <ol>
                    <li>
                        Find the splits you want to use from the <a
                            href="https://github.com/slaurent22/hk-split-maker/blob/main/src/asset/splits.txt"
                            target="_blank" rel="noreferrer"
                        >splits.txt</a> file. For example, if you want to split
                        on "Mask Fragment 4 (Upgrade)", then use "Mask1" as the
                        split name.
                    </li>
                    <li>
                        List your desired splits in the "splitIds" section of
                        the configuration.
                        <ul>
                            <li>
                                Mark a split as a <b>subsplit</b> by prefixing the name with a minus sign (-).
                                These entries will get an autosplit and a segment name beginning with the minus sign,
                                for use with the LiveSplit Subsplits layout component.
                            </li>
                            <li>
                                Include your own <b>manual splits</b> by prefixing the name with a precent sign (%).
                                These entries will neither get an autosplit nor an icon.
                            </li>
                        </ul>
                    </li>
                    <li>
                        Change the other configuration values as you see fit.
                        But don't worry; these are easily changeable from
                        LiveSplit later if needed!
                    </li>
                    <li>
                        Click "Generate". The button will temporarily disable
                        while in progress.
                    </li>
                    <li>
                        Click "Download", and save the file to your computer.
                        Open this file in LiveSplit via right click ➡ Open
                        Splits ➡ From File
                    </li>
                </ol>
                <h2>Video Tutorial</h2>
                <div className="centered">
                    <a href={VIDEO_URL} target="_blank" rel="noreferrer">
                        HK Split Maker Tutorial on YouTube
                    </a>
                </div>
            </div>
        );
    }
}
