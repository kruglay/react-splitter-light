import React, {CSSProperties, Dispatch, MutableRefObject, RefObject, SetStateAction, useEffect, useRef} from 'react';
import {RectParams, SplitterProps} from './Splitter';

export interface RunnerProps {
	refContainer: RefObject<HTMLDivElement | null>;
	startAt: number;
	minBorder: number;
	maxBorder: number;
	paneRefs: MutableRefObject<HTMLDivElement[]>;
	runnerRefs: MutableRefObject<HTMLDivElement[]>;
	pairIndex: [number, number];
	setSizes: Dispatch<SetStateAction<number[]>>;
	onResize?: SplitterProps['onResize'];
	onDragStart?: SplitterProps['onDragStart'];
	onDragEnd?: SplitterProps['onDragEnd'];
	fullSizeInUnits: number;
	discrete?: SplitterProps['discrete'];
	modeParams: RectParams;
	style: CSSProperties;
	className?: string;
}

export const Runner = (props: RunnerProps) => {
	const {
		runnerRefs,
		refContainer,
		startAt,
		minBorder,
		maxBorder,
		paneRefs,
		pairIndex: [index1, index2],
		setSizes,
		onResize,
		onDragStart,
		onDragEnd,
		fullSizeInUnits,
		discrete = false,
		modeParams,
		style,
		className
	} = props;

	const runnerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (runnerRef.current) {
			runnerRefs.current[index1] = runnerRef.current;
		}
	}, [index1, runnerRefs]);

	useEffect(() => {
		let rollback: (() => void) | undefined;

		const runner = runnerRef.current;
		const pane1 = paneRefs.current[index1];
		const pane2 = paneRefs.current[index2];
		if (runner && pane1 && pane2 && refContainer.current) {
			const containerSize = refContainer.current.getBoundingClientRect()[modeParams.size];
			const rate = containerSize / fullSizeInUnits;
			const pairSum = pane1.getBoundingClientRect()[modeParams.size] + pane2.getBoundingClientRect()[modeParams.size];

			const mouseMove = (event: MouseEvent) => {
				if (refContainer.current) {
					const offset = event[modeParams.axis] - refContainer.current.getBoundingClientRect()[modeParams.offset];
					const position = event[modeParams.axis];

					if (offset >= minBorder && offset <= maxBorder) {
						runner.style[modeParams.offset] = `${offset - runner.getBoundingClientRect()[modeParams.size] / 2}px`;
						const pane1Offset = pane1.getBoundingClientRect()[modeParams.offset];
						const flexBasis = discrete ? Math.round((position - pane1Offset) / (Number(discrete) * rate)) * (Number(discrete) * rate) : position - pane1Offset;
						pane1.style.flexBasis = `${flexBasis}px`;
						pane2.style.flexBasis = `${pairSum - (flexBasis)}px`;

						let sum = 0;
						const sizes: number[] = [];
						const sizesInUnits = paneRefs.current.map((pane, ind, arr) => {
							const size = pane.getBoundingClientRect()[modeParams.size];
							sizes.push(size);
							if (ind === arr.length - 1) {
								return fullSizeInUnits - sum;
							}
							const sizeInUnits = (size * fullSizeInUnits) / containerSize;
							sum += sizeInUnits;
							return sizeInUnits;
						});
						onResize && onResize(sizesInUnits, sizes);
					}
				}
			};

			const mouseUp = (event: MouseEvent) => {
				document.removeEventListener('mouseup', mouseUp);
				document.removeEventListener('mousemove', mouseMove);
				if (paneRefs.current) {
					setSizes((prev) => {
						const pane1 = paneRefs.current[index1];
						const pane2 = paneRefs.current[index2];
						const newSizes = [...prev];
						if (pane1 && pane2) {
							newSizes[index1] = pane1.getBoundingClientRect()[modeParams.size];
							newSizes[index2] = pane2.getBoundingClientRect()[modeParams.size];
						}
						return newSizes;
					});
					onDragEnd?.(event, [index1, index2]);
				}
			};

			const mouseDown = (event: MouseEvent) => {
				if (event.button === 0) {
					event.preventDefault();
					onDragStart?.(event, [index1, index2]);
					document.addEventListener('mouseup', mouseUp);
					document.addEventListener('mousemove', mouseMove);
				}
			};

			rollback = () => {
				return runner.removeEventListener('mousedown', mouseDown);
			};

			runner.addEventListener('mousedown', mouseDown);
		}


		return rollback;
	}, [discrete, maxBorder, minBorder, onResize, refContainer, setSizes]);

	return (
		<div
			className={`runner-container ${className}`}
			ref={runnerRef}
			style={{
				...style,
				[modeParams.offset]: startAt - (runnerRef.current?.getBoundingClientRect()?.[modeParams.size] || 0) / 2,
			}}
		/>
	);
};