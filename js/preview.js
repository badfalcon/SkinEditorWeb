/**
 * Created by falcon on 2015/12/07.
 */
$(function () {
    var canvasFrame, camera, scene, renderer;
    var model;
    var controls;
    var width, height;
    var texture;

    init();         // 基本的な設定を初期化
    init_camera();  // カメラを初期化
    init_light();   // ライトを初期化
    init_object();  // オブジェクトを初期化
    animate();      // アニメーションを描画
    onWindowResize();

    function init() {
        // キャンバスフレームDOM要素の取得
        canvasFrame = $('#preview_space');
        // レンダラーを作成
        renderer = new THREE.WebGLRenderer({alpha: true, preserveDrawingBuffer: true});
        // canvas要素のサイズを設定
        height = $(window).height();
        width = $(window).width() / 3;
        console.log(width);
        $('#editor_wrapper').css("width", $(window).width() - 5 - width + "px");
        renderer.setSize(width, height);
        renderer.domElement.setAttribute("id", "test");
        // 背景色を設定
        // transparent
        renderer.setClearColor(0x000000, 0);

        //renderer.setClearColor(0xf88000, 1.0);
        // body要素にcanvas要素を追加
        canvasFrame.append(renderer.domElement);
        // シーンの作成
        scene = new THREE.Scene();
        // ウインドウサイズが変更された際のイベントを登録
        window.addEventListener('resize', onWindowResize, false);
    }

    function init_camera() {
        // カメラを作成
        camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

        // カメラの位置を設定
        camera.position.set(0, 0, 125);
        // カメラの向きを設定
        camera.lookAt({x: 0, y: 0, z: 0});

        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function init_light() {
        var ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
        scene.add(ambientLight);
        var directionalLight = new THREE.DirectionalLight('#ffffff', 1);
        directionalLight.position.set(0, 7, 0);
        scene.add(directionalLight);

    }

    function init_object() {

        var canvas = $('canvas#current')[0];

        // テクスチャの作成
        //texture = new THREE.Texture(canvas);
        texture = new THREE.CanvasTexture(canvas);
        //texture = THREE.ImageUtils.loadTexture('img/skin_template_new.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        //texture.anisotropy = renderer.getMaxAnisotropy();

        model = new PlayerModel(texture);
        scene.add(model.group);
    }

    function onWindowResize() {
        height = $(window).height();
        width = $(window).width() / 3;
        console.log(width);

        $('#editor_wrapper').css("width", $(window).width() - 5 - width + "px");

        // アスペクト比を設定
        camera.aspect = width / height;
        // カメラの設定を更新
        camera.updateProjectionMatrix();
        // canvas要素のサイズを設定
        renderer.setSize(width, height);
    }

    function animate() {
        // アニメーション
        requestAnimationFrame(animate);
        // オブジェクトを回転

//        object.rotation.x += 0.005;
//        object.rotation.y += 0.01;
        // レンダリング
        //t.needsUpdate = true;

        //texture.needsUpdate = true;

        model.modelTexUpdate();
        controls.update();
        renderer.render(scene, camera);
    }
});