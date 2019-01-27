/*! txtgl v1.0.0 | (c) 2018 Johann Troendle | https://github.com/JoTrdl/txtgl.git */
/**
 * TxtGL module.
 * @namespace TxtGL
 */
;(function (root) {
  'use strict'

  var TxtGL = {}

  var DEVICE_PIXEL_RATIO = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1

  /**
   * @function get3DContext
   * @memberof TxtGL
   * @static
   *
   * Get a 3d context from the canvas
   * Pass options to the canvas.getContext() function.
   *
   * @param  {HTMLCanvasElement}      canvas  The canvas element
   * @param  {Object}                 options Options to pass to getContext()
   * @return {WebGLRenderingContext}  The WebGL context or null if not supported
   */
  TxtGL.get3DContext = function (canvas, options) {
    var names = ['webgl', 'experimental-webgl']
    var context = null

    for (var i = 0; i < names.length; i++) {
      try {
        context = canvas.getContext(names[i], options)
      } catch (e) {}
      if (context) {
        break
      }
    }
    return context
  }

  /**
   * @function createProgram
   * @memberof TxtGL
   * @static
   *
   * Create a GL program.
   *
   * @param  {WebGLRenderingContext} gl        WebGL context
   * @param  {String}                vertex    Vertex code
   * @param  {String}                fragment  Fragment code
   * @return {Program}                         The program compiled & linked.
   */
  TxtGL.createProgram = function (gl, vertex, fragment) {
    var vs
    var fs
    var program = gl.createProgram()

    try {
      vs = this.compileShader(gl, vertex, gl.VERTEX_SHADER)
      fs = this.compileShader(gl, fragment, gl.FRAGMENT_SHADER)
    } catch (e) {
      gl.deleteProgram(program)
      throw e
    }

    gl.attachShader(program, vs)
    gl.deleteShader(vs)
    gl.attachShader(program, fs)
    gl.deleteShader(fs)
    gl.linkProgram(program)
    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(program)
      throw new Error('Could not compile WebGL program:\n' + info)
    }

    return program
  }

  /**
   * @function compileShader
   * @memberof TxtGL
   * @static
   *
   * Compile the shader.
   *
   * @param  {WebGLRenderingContext} gl   WebGL context
   * @param  {String}                code Shader code
   * @param  {Int}                   type Shader type (gl.VERTEX_SHADER | gl.FRAGMENT_SHADER)
   * @return {Shader}                Compiled shader
   */
  TxtGL.compileShader = function (gl, code, type) {
    var shader = gl.createShader(type)

    gl.shaderSource(shader, code)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var lines = gl.getShaderSource(shader).split('\n')
      var src = ''
      for (var i = 0; i < lines.length; i++) {
        src += (i + 1) + '.' + lines[i] + '\n'
      }
      throw new Error('GLSL Compilation Error:\n' + gl.getShaderInfoLog(shader) + '\n' + src)
    }

    return shader
  }

  /**
   * @function createTexture
   * @memberof TxtGL
   * @static
   *
   * Create an empty texture.
   *
   * @param  {WebGLRenderingContext} gl      WebGL context
   * @param  {Number}                width   Width
   * @param  {Number}                height  Height
   * @param  {Object}                options Extra options
   * @return {Texture}                       The texture
   */
  TxtGL.createTexture = function (gl, width, height, options) {
    var texture = gl.createTexture()

    // save infos in texture for future bindings
    var format = texture.format = (options && options.format) || gl.RGBA
    var level = texture.level = (options && options.level) || 0
    var type = texture.type = (options && options.type) || gl.UNSIGNED_BYTE
    var border = texture.border = (options && options.border) || 0
    var min = (options && options.minFilter) || gl.NEAREST
    var mag = (options && options.magFilter) || gl.NEAREST
    var wrapS = (options && options.wrapS) || gl.CLAMP_TO_EDGE
    var wrapT = (options && options.wrapT) || gl.CLAMP_TO_EDGE
    var data = (options && options.data) || null
    var flipY = (options && options.flipY) || false
    var preAlpha = (options && options.preAlpha) || false
    // var colorConvsersion = (options && options.colorConvsersion) || gl.BROWSER_DEFAULT_WEBGL

    if (type === gl.FLOAT) {
      var extensions = gl.getSupportedExtensions()
      if (extensions.indexOf('OES_texture_float') < 0) {
        throw new Error('Type gl.FLOAT is not supported.')
      }
      // else activate the float extension
      gl.getExtension('OES_texture_float')

      if (min === gl.LINEAR || mag === gl.LINEAR) {
        if (extensions.indexOf('OES_texture_float_linear') < 0) {
          throw new Error('Type gl.FLOAT with filter gl.LINEAR is not supported.')
        }
        // else activate the float_linear extension
        gl.getExtension('OES_texture_float_linear')
      }
    }

    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, preAlpha)

    if (!data || data instanceof ArrayBuffer) {
      gl.texImage2D(gl.TEXTURE_2D, level, format, width, height, border, format, type, data)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, level, format, format, type, data)
    }

    gl.bindTexture(gl.TEXTURE_2D, null)

    return texture
  }

  /**
   * The default vertex.
   * @type {String}
   */
  var DEFAULT_VERTEX_SHADER = [
    'attribute vec2 position;',
    'varying vec2 uv;',

    'void main() {',
    '  uv = position;',
    '  vec2 pos = position * 2.0 - 1.0;',
    '  gl_Position = vec4(pos.x, pos.y, 0, 1);',
    '}'
  ].join('\n')

  var HEADER_FRAGMENT_SHADER = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    '  precision highp float;',
    '#else',
    '  precision mediump float;',
    '#endif',

    'uniform sampler2D sampler;',
    'uniform vec3 resolution;',
    'uniform int frame;',
    'uniform float time;',
    'varying vec2 uv;'
  ].join('\n')

  var BODY_FRAGMENT_SHADER = [
    'void main() {',
    '  gl_FragColor = texture2D(sampler, uv);',
    '}'
  ].join('\n')

  /**
   * The default fragment to paint in buffer.
   * @type {String}
   */
  var DEFAULT_FRAGMENT_SHADER = [
    HEADER_FRAGMENT_SHADER,
    BODY_FRAGMENT_SHADER
  ].join('\n')

  /**
   * 2 triangles (plane) for painting the result
   * @type {Float32Array}
   */
  var PAINT_VERTICES = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0
  ])

  /**
   * Pre-compute VERTICES length
   * @type {Number}
   */
  var PAINT_VERTICES_LENGTH = PAINT_VERTICES.length / 2

  /**
   * Apply uniform.
   *
   * @param  {Object} gl       GL context
   * @param  {Object} shader   Shader program
   * @param  {Object} type     GL uniform type or 't' for texture
   * @param  {String} location Uniform name
   * @param  {Object} value    Value to set
   * @param  {Object} texture  Web GL texture if type is 't'
   */
  var applyUniform = function (gl, shader, type, location, value, texture) {
    var uLocation = gl.getUniformLocation(shader, location)

    if (value === null || !uLocation) {
      return
    }

    var values = (value.length) ? value : [value]

    if (!texture) {
      var args = [uLocation].concat(values)
      type.apply(gl, args)
    } else { // texture to bind
      type.call(gl, uLocation, value)

      var textures = (texture.length) ? texture : [texture]
      var t
      for (var i = 0; i < textures.length; i++) {
        t = (textures[i].isTxtGLTexture && textures[i].output) || textures[i]
        gl.activeTexture(gl.TEXTURE0 + values[i])
        gl.bindTexture(gl.TEXTURE_2D, t)
      }
    }
  }

  /**
   * Apply attribute.
   *
   * @param  {Object} gl       GL context
   * @param  {Object} shader   Shader program
   * @param  {String} location Location name
   */
  var applyAttribute = function (gl, shader, location, size, buffer, data) {
    var locationId = gl.getAttribLocation(shader, location)

    if (locationId < 0) {
      return
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    gl.bindAttribLocation(shader, locationId, 'position')
    gl.vertexAttribPointer(locationId, size, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(locationId)
  }

  /**
   * @class Texture
   * @constructor
   * @memberof TxtGL
   * @static
   *
   * Texture constructor
   * @param {WebGLRenderingContext} gl      WebGL context for rendering
   * @param {Object}                options Object of options.
   */
  var Texture = TxtGL.Texture = function (gl, options) {
    this.isTxtGLTexture = true
    this.options = options || {}
    this.gl = gl

    if (!(gl && gl instanceof WebGLRenderingContext)) {
      console.log('Error, paramater [gl] must be a WebGL context')
      return
    }

    // Init texture size
    this.width = (this.options.width || gl.canvas.offsetWidth) * DEVICE_PIXEL_RATIO
    this.height = (this.options.height || gl.canvas.offsetHeight) * DEVICE_PIXEL_RATIO

    // Init viewport size
    this.viewportWidth = this.options.viewportWidth || gl.canvas.width
    this.viewportHeight = this.options.viewportHeight || gl.canvas.height

    this.uResolution = [this.width / this.height, 1.0, DEVICE_PIXEL_RATIO]

    this.reset()
  }

  /**
   * Reset the Texture
   *
   * @return {TextureInstance}  this
   */
  Texture.prototype.reset = function (keepOutput) {
    var gl = this.gl
    this.shaders = [] // Shaders list
    this.attributes = [] // Atrributes list
    this.uniforms = [] // Uniforms list

    // Framebuffer & Ping-Pong textures
    this.frameBuffer = gl.createFramebuffer()
    this.textures = [
      TxtGL.createTexture(gl, this.width, this.height, this.options.texture),
      TxtGL.createTexture(gl, this.width, this.height, this.options.texture)
    ]

    this.frame = 0
    this.time = 0
    this.output = (keepOutput !== true && this.textures[0]) || this.output

    // Paint buffer & shader
    this.quadBuffer = gl.createBuffer()
    this.paintShader = TxtGL.createProgram(gl, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
    this.quadVertices = new Float32Array(PAINT_VERTICES)

    this.geometryBuffer = this.quadBuffer
    this.vertices = this.quadVertices
    this.arrays = [gl.TRIANGLE_STRIP, 0, PAINT_VERTICES_LENGTH] // default to quad

    // Process custom geometry
    if (this.options.geometry) {
      this.vertices = this.options.geometry.vertices
      this.arrays = this.options.geometry.arrays
    }

    return this
  }

  /**
   * Add a new fragment in the Texture chain with DEFAULT_VERTEX_SHADER vertex.
   *
   * @param  {String} fragmentShader  The fragment shader
   * @return {TextureInstance}        this
   */
  Texture.prototype.fragment = function (fragment, uniforms) {
    return this.vertexFragment(DEFAULT_VERTEX_SHADER, fragment, uniforms)
  }

  /**
   * Add a new vertex/fragment in the Texture chain.
   *
   * @param  {String} vertexShader   The vertext shader
   * @param  {String} fragmentShader The fragment shader
   * @return {TextureInstance}       this
   */
  Texture.prototype.vertexFragment = function (vertex, fragment, userUniforms, userAttributes) {
    var shader = TxtGL.createProgram(this.gl, vertex, HEADER_FRAGMENT_SHADER + '\n' + fragment)

    this.shaders.push(shader)
    this.uniforms.push(userUniforms || {})

    // Init buffers before pushing on stack
    for (var a in userAttributes) {
      userAttributes[a].buffer = this.gl.createBuffer()
    }

    this.attributes.push(userAttributes || {})

    return this
  }

  /**
   * Render an image on the chain.
   *
   * @param  {Boolean} flipY    Flip the Y axis, default to true
   * @return {TextureInstance}  this
   */
  Texture.prototype.image = function (image, flipY) {
    var texture = TxtGL.createTexture(this.gl, this.width, this.height, {
      flipY: flipY || true,
      data: image
    })
    var uniforms = {
      sampler: { type: 't', value: texture }
    }

    return this.vertexFragment(DEFAULT_VERTEX_SHADER, BODY_FRAGMENT_SHADER, uniforms)
  }

  /**
   * Paint the Texture on the screen buffer.
   * @return {TextureInstance} this
   */
  Texture.prototype.paint = function () {
    if (!this.output) {
      console.log('Error: no output to paint. Call render() at least once.')
      return this
    }

    var gl = this.gl

    gl.useProgram(this.paintShader)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    applyAttribute(gl, this.paintShader, 'position', 2, this.quadBuffer, this.quadVertices)
    applyUniform(gl, this.paintShader, gl.uniform1i, 'sampler', 0, this.output)

    gl.viewport(0, 0, this.viewportWidth, this.viewportHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, PAINT_VERTICES_LENGTH)

    return this
  }

  /**
   * Resize the Texture
   *
   * @param  {Number} width          New texture width, default canvas.width
   * @param  {Number} height         New texture height, default canvas.height
   * @param  {Number} viewportWidth  New viewport width, default canvas.width
   * @param  {Number} viewportHeight News viewport height, default canvas.height
   * @return {TextureInstance}       this
   */
  Texture.prototype.resize = function (width, height, viewportWidth, viewportHeight) {
    var gl = this.gl

    this.width = width || (gl.canvas.offsetWidth * DEVICE_PIXEL_RATIO)
    this.height = height || (gl.canvas.offsetHeight * DEVICE_PIXEL_RATIO)
    this.viewportWidth = viewportWidth || gl.canvas.width
    this.viewportHeight = viewportHeight || gl.canvas.height

    this.uResolution = [this.width / this.height, 1.0, DEVICE_PIXEL_RATIO]

    for (var i = 0; i < this.textures.length; i++) {
      var t = this.textures[i]
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, t.level, t.format, this.width, this.height, t.border, t.format, t.type, null)
    }

    return this
  }

  /**
   * Render the texture.
   *
   * @return {TextureInstance}  this
   */
  Texture.prototype.render = function () {
    var gl = this.gl
    var i
    var index
    var input
    var textureUnit

    this.time = Date.now() * 0.001

    for (i = 0; i < this.shaders.length; i++) {
      textureUnit = 0

      // Ping pong
      input = this.output
      index = (++this.frame) % 2
      this.output = this.textures[index]

      if (this.shaders[i].callback) {
        var out = this.shaders[i].callback(input)
        if (out) {
          this.output = out
          continue
        }
      }

      // Bind program & framebuffer
      gl.useProgram(this.shaders[i])
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.output, 0)

      // apply default attribute/uniforms
      applyAttribute(gl, this.shaders[i], 'position', 2, this.geometryBuffer, this.vertices)
      applyUniform(gl, this.shaders[i], gl.uniform1i, 'sampler', textureUnit++, input)
      applyUniform(gl, this.shaders[i], gl.uniform1i, 'frame', this.frame)
      applyUniform(gl, this.shaders[i], gl.uniform1f, 'time', this.time)
      applyUniform(gl, this.shaders[i], gl.uniform3f, 'resolution', this.uResolution)

      // apply user attributes
      for (var a in this.attributes) {
        applyAttribute(gl, this.shaders[i], a, this.attributes[a].size, this.attributes[a].buffer, this.attributes[a].data)
      }

      // Apply user uniforns, take care of the custom 't' type for texture
      for (var u in this.uniforms[i]) {
        var type = gl['uniform' + this.uniforms[i][u].type]
        var value = this.uniforms[i][u].value
        var texture = null

        if (this.uniforms[i][u].type === 't') {
          type = gl.uniform1i
          value = textureUnit++
          texture = this.uniforms[i][u].value
        }

        applyUniform(gl, this.shaders[i], type, u, value, texture)
      }

      // Draw the shaders
      gl.viewport(0, 0, this.width, this.height)
      gl.drawArrays.apply(gl, this.arrays)
    }

    return this
  }

  /**
   * Iterate the last program on the stack.
   *
   * @param  {Number} count Iterate count
   * @return {TextureInstance} this
   */
  Texture.prototype.iterate = function (count) {
    var shader = this.shaders[this.shaders.length - 1]
    var uniform = this.uniforms[this.uniforms.length - 1]

    for (var i = 0; i < count; i++) {
      this.shaders.push(shader)
      this.uniforms.push(uniform)
    }

    return this
  }

  /**
   * Calbback hook
   *
   * @param  {Function} callback Iteration function
   * @return {TextureInstance} this
   */
  Texture.prototype.callback = function (callback) {
    this.fragment(BODY_FRAGMENT_SHADER)

    var shader = this.shaders[this.shaders.length - 1]
    shader.callback = callback

    return this
  }

  /**
   * Clear the framebuffer.
   *
   * @return {TextureInstance}  this
   */
  Texture.prototype.clear = function () {
    if (!this.frame) { // Nothing to clear
      return this
    }

    var gl = this.gl

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)

    return this
  }

  /**
   * Write in the texture.
   * This write in gl.RGBA format
   *
   * @return {TextureInstance}  this
   */
  Texture.prototype.write = function (xoffset, yoffset, width, height, type, data) {
    var gl = this.gl

    var buffer
    switch (type) {
      case gl.UNSIGNED_BYTE:
      case gl.UNSIGNED_SHORT:
        buffer = new Uint8Array(data)
        break
      case gl.FLOAT:
        buffer = new Float32Array(data)
        break
      case gl.UNSIGNED_INT:
      default:
        buffer = new Int32Array(data)
    }

    gl.bindTexture(gl.TEXTURE_2D, this.output)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, type, buffer)
  };

  // Export
  (function (root, factory) {
    /* eslint-disable no-undef */
    if (typeof define === 'function' && define.amd) {
      define([], factory)
    } else if (typeof exports === 'object') {
      module.exports = factory()
    } else {
      root.TxtGL = factory()
    }
  }(root, function () {
    return TxtGL
  }))
})(this)
