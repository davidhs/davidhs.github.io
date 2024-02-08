import React from "../../js/3rd/es-react/react.js";
import jsx from "../../js/3rd/es-react/jsx.js";

const { useState, useRef, useEffect } = React;

const paragraphs = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula porta quam, id dictum tortor malesuada a. In hac habitasse platea dictumst. Quisque sit amet sem sit amet odio sagittis ultricies. Donec ornare volutpat nibh. Etiam convallis enim vel varius posuere. Suspendisse sit amet varius sem. Mauris dictum, elit sit amet dictum finibus, est leo sagittis lectus, eget pulvinar nisi quam eu velit. Donec diam ante, consequat ut placerat porttitor, sagittis malesuada risus. Phasellus ultricies ligula eget lorem suscipit, ut rhoncus risus vehicula. Mauris quis ante a tortor gravida mollis in ac neque. Aenean volutpat accumsan ex, eu interdum metus dignissim at. Fusce feugiat pretium turpis, non elementum libero commodo vulputate. Sed felis ante, ornare eget aliquet at, pellentesque et leo. Duis placerat mollis felis facilisis tincidunt. Quisque auctor sapien a ante mattis, at euismod tortor blandit. Fusce rhoncus nibh at risus luctus molestie.

Donec suscipit lectus augue, sed luctus diam bibendum id. Praesent interdum consequat ipsum nec venenatis. Nunc vel enim vel ipsum lobortis venenatis. Maecenas eu dapibus felis, et convallis elit. Quisque scelerisque lacinia ex, eu iaculis quam feugiat non. Duis in egestas ipsum, id faucibus magna. Nunc egestas, nibh convallis hendrerit mollis, tellus lectus aliquet libero, eu cursus lorem augue vel justo. Praesent ut leo consectetur mi lobortis feugiat vel in ante. Nam sed orci mollis ligula consectetur dapibus. Curabitur elementum, justo nec molestie lacinia, neque leo luctus tellus, eget mattis dolor neque eu sem. Aliquam id lorem non risus lacinia ullamcorper. Nullam vitae odio in orci euismod posuere. Nunc gravida facilisis purus, vel varius tortor. Maecenas suscipit, metus nec porta pulvinar, ligula velit pharetra augue, non tincidunt sem purus ut dolor.

Praesent accumsan viverra augue id vestibulum. Pellentesque placerat fringilla tellus in sodales. Praesent congue erat ac dui consequat, sed fringilla libero lobortis. Aenean tincidunt urna justo, nec interdum eros pretium vitae. Donec tincidunt est sed lorem pulvinar pharetra. Proin cursus lectus quis lectus feugiat semper. In imperdiet nulla vitae justo iaculis, vel elementum lorem ultrices. Donec scelerisque scelerisque dui eget blandit.

Nunc quis ligula in nunc pharetra aliquet vel ut metus. Pellentesque fermentum nunc eros, quis luctus nulla venenatis quis. Morbi eleifend, nibh quis molestie molestie, ante risus tempor justo, nec dignissim dolor quam at turpis. Sed sagittis, tortor et tempor euismod, arcu augue faucibus enim, eu placerat ligula lectus eu lorem. Nunc pulvinar tortor leo, in luctus ligula molestie sit amet. Cras ultricies euismod mollis. Sed a libero ultricies, lobortis nisl non, rhoncus orci.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam lobortis ante eget rhoncus blandit. Nullam eget diam ipsum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse iaculis ante id ipsum rhoncus, a feugiat mi luctus. Sed sollicitudin scelerisque risus, vel fermentum ex molestie sit amet. Vestibulum quis risus nisi. Nunc vel mauris vitae est cursus vulputate. In hendrerit libero vitae est auctor blandit. Maecenas auctor lacus a pretium sollicitudin. Nulla ac erat sed purus venenatis porttitor. Vestibulum consequat mauris a interdum accumsan.

Suspendisse in lacus iaculis, condimentum orci ac, finibus sem. Nunc nec finibus justo. Vivamus ac nulla a nisi cursus vestibulum. Duis convallis sem sit amet ligula dapibus, vel ullamcorper lectus porta. Nam volutpat convallis nulla at porta. Suspendisse finibus sapien urna, id pellentesque augue porttitor in. In luctus orci sit amet elit varius ultrices. Pellentesque posuere massa vel varius laoreet. Phasellus pharetra diam rhoncus dui convallis, et feugiat ex rhoncus. Sed interdum mauris quis efficitur lobortis. Ut elit nisl, sagittis ac feugiat nec, sollicitudin malesuada urna. Vivamus sit amet elit venenatis, dignissim metus ut, posuere quam. 
`.split("\n").filter((p) => p.length > 0);

/**
 * @param {number} i 
 */
function getParagraph(i) {
	const n = paragraphs.length;

	return paragraphs[i % n];
}

/**
 * @param {{ paragraphs: number }} props 
 */
export function LoremIpsum(props) {
	/** @type {string[]} */
	const paragraphs = [];

	for (let i = 0; i < props.paragraphs; i++) {
		paragraphs.push(jsx`<p key=${i}>${getParagraph(i)}</p>`);
	}

	return paragraphs;
}
