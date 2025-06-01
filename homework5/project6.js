var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;
	vec3  k_s;
	float n;
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		vec3 oc = ray.pos - spheres[i].center;
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(oc, ray.dir);
		float c = dot(oc, oc) - spheres[i].radius * spheres[i].radius;
		float discriminant = b*b - 4.0*a*c;

		if (discriminant > 0.0) {
			float sqrtDisc = sqrt(discriminant);
			float t1 = (-b - sqrtDisc) / (2.0 * a);
			float t2 = (-b + sqrtDisc) / (2.0 * a);
			float t = (t1 > 0.0001) ? t1 : ((t2 > 0.0001) ? t2 : -1.0);

			if (t > 0.0 && t < hit.t) {
				hit.t = t;
				hit.position = ray.pos + t * ray.dir;
				hit.normal = normalize(hit.position - spheres[i].center);
				hit.mtl = spheres[i].mtl;
				foundHit = true;
			}
		}
	}
	return foundHit;
}

vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		vec3 L = normalize(lights[i].position - position);
		vec3 N = normalize(normal);
		vec3 H = normalize(L + view);

		// Shadow ray
		Ray shadowRay;
		shadowRay.pos = position + 0.001 * N;
		shadowRay.dir = L;

		HitInfo shadowHit;
		bool inShadow = IntersectRay(shadowHit, shadowRay);
		if (inShadow && shadowHit.t < length(lights[i].position - position))
			continue;

		// Diffuse
		vec3 diffuse = mtl.k_d * max(dot(N, L), 0.0) * lights[i].intensity;

		// Specular (Blinn)
		vec3 specular = mtl.k_s * pow(max(dot(N, H), 0.0), mtl.n) * lights[i].intensity;

		color += diffuse + specular;
	}
	return color;
}

vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );

		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( k_s.r + k_s.g + k_s.b <= 0.0 ) break;

			Ray r;
			r.pos = hit.position + 0.001 * hit.normal;
			r.dir = reflect(ray.dir, hit.normal);

			HitInfo h;
			if ( IntersectRay( h, r ) ) {
				view = normalize(-r.dir);
				vec3 reflectedColor = Shade(h.mtl, h.position, h.normal, view);
				clr += k_s * reflectedColor;

				k_s *= h.mtl.k_s;
				hit = h;
				ray = r;
			} else {
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;
			}
		}
		return vec4( clr, 1 );
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );
	}
}
`;
