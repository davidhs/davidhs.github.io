#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2 iResolution;

// ---------------------------------------------------
// Human fovea detector by nimitz (twitter: @stormoid)
// Original ShaderToy: https://www.shadertoy.com/view/4dsXzM
// ---------------------------------------------------

#define scale 90.0
#define thickness 0.0
#define lengt 0.13
#define layers 15.0
#define time iTime * 3.0

// ---- HELPER FUNCTIONS ----
vec2 hash12(float p)
{
    return fract(vec2(sin(p * 591.32), cos(p * 391.32)));
}

float hash21(in vec2 n) 
{ 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec2 hash22(in vec2 p)
{
    p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
    return fract(sin(p) * 43758.5453);
}

mat2 makem2(in float theta)
{
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}

float field1(in vec2 p)
{
    vec2 n = floor(p) - 0.5;
    vec2 f = fract(p) - 0.5;
    vec2 o = hash22(n) * 0.35;
    vec2 r = -f - o;
    r *= makem2(time + hash21(n) * 3.14);

    float d  = 1.0 - smoothstep(thickness, thickness + 0.09, abs(r.x));
    d       *= 1.0 - smoothstep(lengt, lengt + 0.02, abs(r.y));

    float d2 = 1.0 - smoothstep(thickness, thickness + 0.09, abs(r.y));
    d2      *= 1.0 - smoothstep(lengt, lengt + 0.02, abs(r.x));

    return max(d, d2);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord.xy / iResolution - 0.5;
    p.x *= iResolution.x / iResolution.y;
    
    float mul = (iResolution.x + iResolution.y) / scale;
    
    vec3 col = vec3(0.0);
    for (float i = 0.0; i < layers; i++)
    {
        vec2 ds = hash12(i * 2.5) * 0.20;
        col = max(
            col,
            field1((p + ds) * mul)
            * (sin(ds.x * 5100.0 + vec3(1.0,2.0,3.5)) * 0.4 + 0.6)
        );
    }
    
    fragColor = vec4(col, 1.0);
}

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
