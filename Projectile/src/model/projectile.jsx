import { convert_to_points, discriminant, gen_points, radians, range } from "./utils";


function minu(g, target_y, target_x, num_of_points, finish){
  const minvel = Math.pow(g, 0.5) * Math.pow(target_y + Math.pow(target_x * target_x + target_y * target_y, 0.5), 0.5);
  const points_angle = Math.atan2(target_y + Math.pow(target_x * target_x + target_y * target_y, 0.5), target_x);
  if (finish.x == null){
    finish.x = range(minvel, g, points_angle, 0);
  }
  const points = convert_to_points(gen_points(num_of_points, {x:finish.x, y:finish.y}, 0, points_angle, g, minvel))
  return [minvel, points_angle, points];
}

function low_ball(target_x, target_y, vel, g, finish){
  const [a, b, c] = discriminant(target_x, target_y, vel, g);
  const low_theta = Math.atan2(-b - Math.pow(b * b - 4 * a * c, 0.5), 2 * a);
  if (finish.x == null){
    finish.x = range(vel, g, low_theta, 0);
  }
  const points = convert_to_points(gen_points(50, {x:finish.x, y:finish.y}, 0, low_theta, g, vel))
  return [low_theta, points];
}

function high_ball(target_x, target_y, vel, g, finish){
  const [a, b, c] = discriminant(target_x, target_y, vel, g);
  const high_theta = Math.atan2(-b + Math.pow(b * b - 4 * a * c, 0.5), 2 * a);
  if (finish.x == null){
    finish.x = range(vel, g, high_theta, 0);
  }
  const points = convert_to_points(gen_points(50, {x:finish.x, y:finish.y}, 0, high_theta, g, vel))
  return [high_theta, points];
}

function max_r(g, height, vel){
  const mprange = vel * vel * 1/g * Math.pow(1 + (2 * g* height)/(vel * vel), 0.5);
  const mangle = Math.asin(1/Math.pow(2 + (2 * g * height)/(vel * vel), 0.5));
  const ppoints = gen_points(50, {x:mprange, y:0}, height, mangle, g, vel)
  const points = convert_to_points(ppoints)
  return [mprange, mangle, points, ppoints];
}

function bounding_parabola(num_of_points, final_point,g, vel ){
  let ppoints = {x: [], y: []}
  for(let x = 0; x < num_of_points; x++){
    var curr_x = 0 + x * final_point.x/50;
    ppoints.x.push(curr_x);
    ppoints.y.push((vel * vel)/(2*g) - (g*curr_x*curr_x)/(2 * vel * vel));
  }
  ppoints.x.push(final_point.x);
  ppoints.y.push(final_point.y);
  return ppoints;
}

function distance_travelled_i(dx, dy){
  let s = 0;
  for (let x = 0; x < dx.length; x++){
    s += Math.sqrt(dx[x] * dx[x] + dy[x] * dy[x]);
  }
  return s
}

function distance_travelled(vel, g, rangle, prange){
  const z_func = (z) => {
    return 0.5 * Math.log(Math.abs(Math.sqrt(1 + z*z) + z)) + 0.5 * z * Math.sqrt(1+z*z);
  }
  a = (vel * vel) / (g * (1 + Math.pow(Math.tan(rangle), 2)));
  b = Math.tan(rangle);
  c = Math.tan(rangle) - g * prange * (1 + Math.pow(Math.tan(rangle), 2) / (vel * vel))
  return a * (z_func(b) - z_func(c));
}

function gen_points_3d(start_loc, launch_angle, azimuth_angle, v0, g, lat){
  const theta = radians(launch_angle);
  const phi = radians(azimuth_angle);
  const omega = 7.2921e-5
  const R = 6371000
  var velocity = {
    x: v0 * Math.cos(theta) * Math.cos(phi),
    y: v0 * Math.sin(theta),
    z: v0 * Math.cos(theta) * Math.sin(phi)
  }
  const acceleration = {
    x: 0,
    y: -g,
    z: 0, 
  }
  //verlet method
  function verlet(loc, velocity, acceleration, dt){
    let return_vel = {
      x: (velocity.x + acceleration.x * dt),
      y: (velocity.y + acceleration.y * dt),
      z: (velocity.z + acceleration.z * dt)
    }
    console.log(velocity.y)
    let return_loc = {
      x: (loc.x + return_vel.x * dt) * 0.01 ,
      y: (loc.y + return_vel.y * dt ) * 0.01,
      z: (loc.z + return_vel.z * dt) * 0.01,
    }
    return [return_loc, return_vel]
  }
  const time_step = 0.001
  var loc = start_loc
  let locs = [start_loc]
  for (let x = 0; x<= 500; x++){
    [loc, velocity] = verlet(loc, velocity, acceleration, time_step)
    locs.push(loc);
  }    
  console.log(locs)
  return locs
}

export {minu, low_ball, high_ball, max_r, bounding_parabola, distance_travelled_i, distance_travelled, gen_points_3d}

