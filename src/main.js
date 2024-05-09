import { entity_manager } from './entity-manager.js';
import { entity } from './entity.js';
import { load_controller } from './load-controller.js';
import { spawners } from './spawners.js';
import { spatial_hash_grid } from './spatial-hash-grid.js';
import { threejs_component } from './threejs-component.js';
import { ammojs_component } from './ammojs-component.js';
import { blaster } from './fx/blaster.js';
import { ui_controller } from './ui-controller.js';
import { crawl_controller } from './crawl-controller.js';
import { math } from './math.js';
import { db, getPlayersEasyLevel, getPlayersMediumLevel, getPlayersHardLevel } from './db.js';
import { THREE } from './three-defs.js';

class QuickGame2_Sequel {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    //tạo quản lý đối tượng 
    this.entityManager_ = new entity_manager.EntityManager();

    //bắt đầu game 
    this.OnGameStarted_();
  }

  OnGameStarted_() {
    this.grid_ = new spatial_hash_grid.SpatialHashGrid(
      [[-5000, -5000], [5000, 5000]], [100, 100]);

    this.LoadControllers_();

    this.previousRAF_ = null;
    this.RAF_();
  }

  LoadControllers_() {
    const threejs = new entity.Entity();
    threejs.AddComponent(new threejs_component.ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs');

    const ammojs = new entity.Entity();
    ammojs.AddComponent(new ammojs_component.AmmoJSController());
    this.entityManager_.Add(ammojs, 'physics');

    // Hack
    this.ammojs_ = ammojs.GetComponent('AmmoJSController');
    this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    this.threejs_ = threejs.GetComponent('ThreeJSController');

    const l = new entity.Entity();
    l.AddComponent(new load_controller.LoadController());
    this.entityManager_.Add(l, 'loader');

    const fx = new entity.Entity();
    fx.AddComponent(new blaster.BlasterSystem({
      scene: this.scene_,
      camera: this.camera_,
      texture: './resources/textures/fx/blaster.jpg',
    }));
    this.entityManager_.Add(fx, 'fx');

    // DEMO
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this.entityManager_.Add(ui, 'ui');

    const basicParams = {
      grid: this.grid_,
      scene: this.scene_,
      camera: this.camera_,
    };

    // DEMO
    // const crawl = new entity.Entity();
    // crawl.AddComponent(new crawl_controller.CrawlController(basicParams))
    // this.entityManager_.Add(crawl);
    var botnumber = 100;
    if(sessionStorage.getItem('level') == '1'){
      botnumber = 300;
    } else if(sessionStorage.getItem('level') == '2'){
      botnumber = 500;
    }
    const spawner = new entity.Entity();
    spawner.AddComponent(new spawners.PlayerSpawner(basicParams));
    spawner.AddComponent(new spawners.TieFighterSpawner(basicParams));
    spawner.AddComponent(new spawners.XWingSpawner(basicParams));
    spawner.AddComponent(new spawners.StarDestroyerSpawner(basicParams));
    spawner.AddComponent(new spawners.StarDestroyerTurretSpawner(basicParams));
    spawner.AddComponent(new spawners.ExplosionSpawner(basicParams));
    spawner.AddComponent(new spawners.TinyExplosionSpawner(basicParams));
    spawner.AddComponent(new spawners.ShipSmokeSpawner(basicParams));
    this.entityManager_.Add(spawner, 'spawners');

    // DEMO
    spawner.GetComponent('PlayerSpawner').Spawn();

    // DEMO

    for (let i = 0; i < botnumber; ++i) {
      const e = spawner.GetComponent('TieFighterSpawner').Spawn();
      const n = new THREE.Vector3(
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
        math.rand_range(-1, 1),
      );
      n.normalize();
      n.multiplyScalar(300);
      // n.add(new THREE.Vector3(0, 0, 1000));
      e.SetPosition(n);
    }

    // for (let i = 0; i < 6; ++i) {
    //   const e = spawner.GetComponent('XWingSpawner').Spawn();
    //   const n = new THREE.Vector3(
    //     math.rand_range(-1, 1),
    //     math.rand_range(-1, 1),
    //     math.rand_range(-1, 1),
    //   );
    //   n.normalize();
    //   n.multiplyScalar(300);
    //   // n.add(new THREE.Vector3(0, 0, 800));
    //   e.SetPosition(n);
    // }

    spawner.GetComponent('StarDestroyerSpawner').Spawn();
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.threejs_.Render();
        this.previousRAF_ = t;
      }

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed) {
    // DEMO
    // const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001) * 0.5;
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS, 0);
    this.entityManager_.Update(timeElapsedS, 1);

    this.ammojs_.StepSimulation(timeElapsedS);
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', async () => {
  const _Setup = () => {
    Ammo().then(function (AmmoLib) {
      Ammo = AmmoLib;
      _APP = new QuickGame2_Sequel();
    });
  };
  console.log(await getPlayersEasyLevel());
  const menu_wrapper = document.querySelector('.menu-wrapper');
  const start_btn = document.querySelectorAll('.start-btn');
  const name_input = document.querySelector('#yourname');
  const name_show = document.querySelector('.name-infor__content');
  const infor = document.querySelector('.infor');
  const rank_up = document.querySelector('.rank-up');
  const main_menu = document.querySelector('.main-menu');
  const ranking = document.querySelector('.ranking');
  const rank_close = document.querySelector('.rank-close');
  rank_up.addEventListener('click', async () => {
    if (document.querySelector('.ranking-list__level').children.length < 2) {
      const easyPlayers = await getPlayersEasyLevel();
      const mediumPlayers = await getPlayersMediumLevel();
      const hardPlayers = await getPlayersHardLevel();
      const level_titles = document.querySelectorAll('.ranking-list__level');
      console.log(easyPlayers);
      easyPlayers.forEach((player, index) => {
        const el = document.createElement('li');
        el.classList.add('ranking-item');
        const span_index = document.createElement('span');
        span_index.classList.add('ranking-item__index');
        const span_name = document.createElement('span');
        span_name.classList.add('ranking-item__name');
        const span_score = document.createElement('span');
        span_score.classList.add('ranking-item__score');
        span_index.innerHTML = index + 1;
        span_name.innerHTML = player.name;
        span_score.innerHTML = player.score;
        el.appendChild(span_index);
        el.appendChild(span_name);
        el.appendChild(span_score);
        level_titles[0].insertAdjacentElement("beforeend", el);
      })
      mediumPlayers.forEach((player, index) => {
        const el = document.createElement('li');
        el.classList.add('ranking-item');
        const span_index = document.createElement('span');
        span_index.classList.add('ranking-item__index');
        const span_name = document.createElement('span');
        span_name.classList.add('ranking-item__name');
        const span_score = document.createElement('span');
        span_score.classList.add('ranking-item__score');
        span_index.innerHTML = index + 1;
        span_name.innerHTML = player.name;
        span_score.innerHTML = player.score;
        el.appendChild(span_index);
        el.appendChild(span_name);
        el.appendChild(span_score);
        level_titles[1].insertAdjacentElement("beforeend", el);
      })
      hardPlayers.forEach((player, index) => {
        const el = document.createElement('li');
        el.classList.add('ranking-item');
        const span_index = document.createElement('span');
        span_index.classList.add('ranking-item__index');
        const span_name = document.createElement('span');
        span_name.classList.add('ranking-item__name');
        const span_score = document.createElement('span');
        span_score.classList.add('ranking-item__score');
        span_index.innerHTML = index + 1;
        span_name.innerHTML = player.name;
        span_score.innerHTML = player.score;
        el.appendChild(span_index);
        el.appendChild(span_name);
        el.appendChild(span_score);
        level_titles[2].insertAdjacentElement("beforeend", el);
      })
    }
    main_menu.style.display = 'none';
    ranking.style.display = 'flex';
  });
  rank_close.addEventListener('click', () => {
    main_menu.style.display = 'flex';
    ranking.style.display = 'none';
  });
  start_btn.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.innerHTML == 'EASY') {
        sessionStorage.setItem('level', '0');
      } else if (btn.innerHTML == 'MEDIUM') {
        sessionStorage.setItem('level', '1');
      } else {
        sessionStorage.setItem('level', '2');
      }
      menu_wrapper.style.display = 'none';
      infor.style.display = 'block';
      name_show.innerHTML = name_input.value || `Guest-${Math.round(math.rand_range(1000, 9999))}`;
      console.log("start_btn");
      _Setup();
    });
  });

  document.querySelector('.game-over .restart-btn').addEventListener('click', function () {
    window.location.reload();
  });


});
