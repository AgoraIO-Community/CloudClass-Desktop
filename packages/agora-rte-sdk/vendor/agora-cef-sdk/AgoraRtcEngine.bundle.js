/*! For license information please see AgoraRtcEngine.bundle.js.LICENSE.txt */
!(function (E, _) {
  if ('object' == typeof exports && 'object' == typeof module) module.exports = _();
  else if ('function' == typeof define && define.amd) define([], _);
  else {
    var R = _();
    for (var A in R) ('object' == typeof exports ? exports : E)[A] = R[A];
  }
})(self, function () {
  return (function () {
    var E = {
        662: function (E) {
          var _ = {
            validateDimension: function (E) {
              if (E <= 0 || E !== (0 | E)) throw 'YUV plane dimensions must be a positive integer';
            },
            validateOffset: function (E) {
              if (E < 0 || E !== (0 | E)) throw 'YUV plane offsets must be a non-negative integer';
            },
            format: function (E) {
              var _ = E.width,
                R = E.height,
                A = E.chromaWidth || _,
                T = E.chromaHeight || R,
                O = E.cropLeft || 0,
                I = E.cropTop || 0,
                N = E.cropWidth || _ - O,
                D = E.cropHeight || R - I,
                S = E.displayWidth || N,
                L = E.displayHeight || D;
              return (
                this.validateDimension(_),
                this.validateDimension(R),
                this.validateDimension(A),
                this.validateDimension(T),
                this.validateOffset(O),
                this.validateOffset(I),
                this.validateDimension(N),
                this.validateDimension(D),
                this.validateDimension(S),
                this.validateDimension(L),
                {
                  width: _,
                  height: R,
                  chromaWidth: A,
                  chromaHeight: T,
                  cropLeft: O,
                  cropTop: I,
                  cropWidth: N,
                  cropHeight: D,
                  displayWidth: S,
                  displayHeight: L,
                }
              );
            },
            allocPlane: function (E, R) {
              return (
                _.validateDimension(E),
                _.validateDimension(R),
                { bytes: new Uint8Array(E * R), stride: E }
              );
            },
            suitableStride: function (E) {
              _.validateDimension(E);
              var R = E % 4;
              return 0 == R ? E : E + (4 - R);
            },
            allocPlane: function (E, _, R, A, T) {
              var O, I;
              if (
                (this.validateDimension(E),
                this.validateDimension(_),
                (T = T || 0),
                (A = A || this.suitableStride(E)),
                this.validateDimension(A),
                A < E)
              )
                throw 'Invalid input stride for YUV plane; must be larger than width';
              if (((O = A * _), R)) {
                if (R.length - T < O)
                  throw 'Invalid input buffer for YUV plane; must be large enough for stride times height';
                I = R.slice(T, T + O);
              } else (I = new Uint8Array(O)), (A = A || this.suitableStride(E));
              return { bytes: I, stride: A };
            },
            lumaPlane: function (E, _, R, A) {
              return this.allocPlane(E.width, E.height, _, R, A);
            },
            chromaPlane: function (E, _, R, A) {
              return this.allocPlane(E.chromaWidth, E.chromaHeight, _, R, A);
            },
            frame: function (E, _, R, A) {
              return {
                format: E,
                y: (_ = _ || this.lumaPlane(E)),
                u: (R = R || this.chromaPlane(E)),
                v: (A = A || this.chromaPlane(E)),
              };
            },
            copyPlane: function (E) {
              return { bytes: E.bytes.slice(), stride: E.stride };
            },
            copyFrame: function (E) {
              return {
                format: E.format,
                y: this.copyPlane(E.y),
                u: this.copyPlane(E.u),
                v: this.copyPlane(E.v),
              };
            },
            transferables: function (E) {
              return [E.y.bytes.buffer, E.u.bytes.buffer, E.v.bytes.buffer];
            },
          };
          E.exports = _;
        },
        826: function (E) {
          E.exports = {
            vertex:
              'precision lowp float;\n\nattribute vec2 aPosition;\nattribute vec2 aLumaPosition;\nattribute vec2 aChromaPosition;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vLumaPosition = aLumaPosition;\n    vChromaPosition = aChromaPosition;\n}\n',
            fragment:
              '// inspired by https://github.com/mbebenita/Broadway/blob/master/Player/canvas.js\n\nprecision lowp float;\n\nuniform sampler2D uTextureY;\nuniform sampler2D uTextureCb;\nuniform sampler2D uTextureCr;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n   // Y, Cb, and Cr planes are uploaded as LUMINANCE textures.\n   float fY = texture2D(uTextureY, vLumaPosition).x;\n   float fCb = texture2D(uTextureCb, vChromaPosition).x;\n   float fCr = texture2D(uTextureCr, vChromaPosition).x;\n\n   // Premultipy the Y...\n   float fYmul = fY * 1.1643828125;\n\n   // And convert that to RGB!\n   gl_FragColor = vec4(\n     fYmul + 1.59602734375 * fCr - 0.87078515625,\n     fYmul - 0.39176171875 * fCb - 0.81296875 * fCr + 0.52959375,\n     fYmul + 2.017234375   * fCb - 1.081390625,\n     1\n   );\n}\n',
            vertexStripe:
              'precision lowp float;\n\nattribute vec2 aPosition;\nattribute vec2 aTexturePosition;\nvarying vec2 vTexturePosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vTexturePosition = aTexturePosition;\n}\n',
            fragmentStripe:
              "// extra 'stripe' texture fiddling to work around IE 11's poor performance on gl.LUMINANCE and gl.ALPHA textures\n\nprecision lowp float;\n\nuniform sampler2D uStripe;\nuniform sampler2D uTexture;\nvarying vec2 vTexturePosition;\nvoid main() {\n   // Y, Cb, and Cr planes are mapped into a pseudo-RGBA texture\n   // so we can upload them without expanding the bytes on IE 11\n   // which doesn't allow LUMINANCE or ALPHA textures\n   // The stripe textures mark which channel to keep for each pixel.\n   // Each texture extraction will contain the relevant value in one\n   // channel only.\n\n   float fLuminance = dot(\n      texture2D(uStripe, vTexturePosition),\n      texture2D(uTexture, vTexturePosition)\n   );\n\n   gl_FragColor = vec4(fLuminance, fLuminance, fLuminance, 1);\n}\n",
          };
        },
        487: function (E) {
          !(function () {
            'use strict';
            function _(E, _) {
              throw new Error('abstract');
            }
            (_.prototype.drawFrame = function (E) {
              throw new Error('abstract');
            }),
              (_.prototype.clear = function () {
                throw new Error('abstract');
              }),
              (E.exports = _);
          })();
        },
        926: function (E, _, R) {
          !(function () {
            'use strict';
            var _ = R(487),
              A = R(627);
            function T(E) {
              var _ = this,
                R = E.getContext('2d'),
                T = null,
                O = null,
                I = null;
              return (
                (_.drawFrame = function (_) {
                  var N = _.format;
                  (E.width === N.displayWidth && E.height === N.displayHeight) ||
                    ((E.width = N.displayWidth), (E.height = N.displayHeight)),
                    (null !== T && T.width == N.width && T.height == N.height) ||
                      (function (E, _) {
                        for (
                          var A = (T = R.createImageData(E, _)).data, O = E * _ * 4, I = 0;
                          I < O;
                          I += 4
                        )
                          A[I + 3] = 255;
                      })(N.width, N.height),
                    A.convertYCbCr(_, T.data);
                  var D,
                    S,
                    L,
                    e = N.cropWidth != N.displayWidth || N.cropHeight != N.displayHeight;
                  e
                    ? (O ||
                        ((S = N.cropWidth),
                        (L = N.cropHeight),
                        ((O = document.createElement('canvas')).width = S),
                        (O.height = L),
                        (I = O.getContext('2d'))),
                      (D = I))
                    : (D = R),
                    D.putImageData(
                      T,
                      -N.cropLeft,
                      -N.cropTop,
                      N.cropLeft,
                      N.cropTop,
                      N.cropWidth,
                      N.cropHeight,
                    ),
                    e && R.drawImage(O, 0, 0, N.displayWidth, N.displayHeight);
                }),
                (_.clear = function () {
                  R.clearRect(0, 0, E.width, E.height);
                }),
                _
              );
            }
            (T.prototype = Object.create(_.prototype)), (E.exports = T);
          })();
        },
        895: function (E, _, R) {
          !(function () {
            'use strict';
            var _ = R(487),
              A = R(826);
            function T(E) {
              var _,
                R,
                O = this,
                I = T.contextForCanvas(E);
              if (null === I) throw new Error('WebGL unavailable');
              function N(E, _) {
                var R = I.createShader(E);
                if (
                  (I.shaderSource(R, _),
                  I.compileShader(R),
                  !I.getShaderParameter(R, I.COMPILE_STATUS))
                ) {
                  var A = I.getShaderInfoLog(R);
                  throw (
                    (I.deleteShader(R),
                    new Error('GL shader compilation for ' + E + ' failed: ' + A))
                  );
                }
                return R;
              }
              var D,
                S,
                L,
                e,
                C,
                t,
                P,
                U,
                n,
                M,
                r = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
                i = {},
                o = {},
                V = {};
              function a(E) {
                return i[E] || (i[E] = I.createTexture()), i[E];
              }
              function u(E, _, R, A) {
                var O = a(E);
                if ((I.activeTexture(I.TEXTURE0), T.stripe)) {
                  var N = !i[E + '_temp'],
                    D = a(E + '_temp');
                  I.bindTexture(I.TEXTURE_2D, D),
                    N
                      ? (I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_S, I.CLAMP_TO_EDGE),
                        I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_T, I.CLAMP_TO_EDGE),
                        I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MIN_FILTER, I.NEAREST),
                        I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MAG_FILTER, I.NEAREST),
                        I.texImage2D(
                          I.TEXTURE_2D,
                          0,
                          I.RGBA,
                          _ / 4,
                          R,
                          0,
                          I.RGBA,
                          I.UNSIGNED_BYTE,
                          A,
                        ))
                      : I.texSubImage2D(
                          I.TEXTURE_2D,
                          0,
                          0,
                          0,
                          _ / 4,
                          R,
                          I.RGBA,
                          I.UNSIGNED_BYTE,
                          A,
                        );
                  var S = i[E + '_stripe'],
                    L = !S;
                  L && (S = a(E + '_stripe')),
                    I.bindTexture(I.TEXTURE_2D, S),
                    L &&
                      (I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_S, I.CLAMP_TO_EDGE),
                      I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_T, I.CLAMP_TO_EDGE),
                      I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MIN_FILTER, I.NEAREST),
                      I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MAG_FILTER, I.NEAREST),
                      I.texImage2D(
                        I.TEXTURE_2D,
                        0,
                        I.RGBA,
                        _,
                        1,
                        0,
                        I.RGBA,
                        I.UNSIGNED_BYTE,
                        (function (E) {
                          if (V[E]) return V[E];
                          for (var _ = E, R = new Uint32Array(_), A = 0; A < _; A += 4)
                            (R[A] = 255),
                              (R[A + 1] = 65280),
                              (R[A + 2] = 16711680),
                              (R[A + 3] = 4278190080);
                          return (V[E] = new Uint8Array(R.buffer));
                        })(_),
                      ));
                } else
                  I.bindTexture(I.TEXTURE_2D, O),
                    I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_S, I.CLAMP_TO_EDGE),
                    I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_T, I.CLAMP_TO_EDGE),
                    I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MIN_FILTER, I.LINEAR),
                    I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MAG_FILTER, I.LINEAR),
                    I.texImage2D(
                      I.TEXTURE_2D,
                      0,
                      I.LUMINANCE,
                      _,
                      R,
                      0,
                      I.LUMINANCE,
                      I.UNSIGNED_BYTE,
                      A,
                    );
              }
              function F(E, _, A) {
                var T = i[E];
                I.useProgram(R);
                var O = o[E];
                O ||
                  (I.activeTexture(I.TEXTURE0),
                  I.bindTexture(I.TEXTURE_2D, T),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_S, I.CLAMP_TO_EDGE),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_T, I.CLAMP_TO_EDGE),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MIN_FILTER, I.LINEAR),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MAG_FILTER, I.LINEAR),
                  I.texImage2D(I.TEXTURE_2D, 0, I.RGBA, _, A, 0, I.RGBA, I.UNSIGNED_BYTE, null),
                  (O = o[E] = I.createFramebuffer())),
                  I.bindFramebuffer(I.FRAMEBUFFER, O),
                  I.framebufferTexture2D(I.FRAMEBUFFER, I.COLOR_ATTACHMENT0, I.TEXTURE_2D, T, 0);
                var N = i[E + '_temp'];
                I.activeTexture(I.TEXTURE1), I.bindTexture(I.TEXTURE_2D, N), I.uniform1i(t, 1);
                var P = i[E + '_stripe'];
                I.activeTexture(I.TEXTURE2),
                  I.bindTexture(I.TEXTURE_2D, P),
                  I.uniform1i(C, 2),
                  I.bindBuffer(I.ARRAY_BUFFER, D),
                  I.enableVertexAttribArray(S),
                  I.vertexAttribPointer(S, 2, I.FLOAT, !1, 0, 0),
                  I.bindBuffer(I.ARRAY_BUFFER, L),
                  I.enableVertexAttribArray(e),
                  I.vertexAttribPointer(e, 2, I.FLOAT, !1, 0, 0),
                  I.viewport(0, 0, _, A),
                  I.drawArrays(I.TRIANGLES, 0, r.length / 2),
                  I.bindFramebuffer(I.FRAMEBUFFER, null);
              }
              function G(E, R, A) {
                I.activeTexture(R),
                  I.bindTexture(I.TEXTURE_2D, i[E]),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_S, I.CLAMP_TO_EDGE),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_WRAP_T, I.CLAMP_TO_EDGE),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MIN_FILTER, I.LINEAR),
                  I.texParameteri(I.TEXTURE_2D, I.TEXTURE_MAG_FILTER, I.LINEAR),
                  I.uniform1i(I.getUniformLocation(_, E), A);
              }
              function c(E, _) {
                var R = N(I.VERTEX_SHADER, E),
                  A = N(I.FRAGMENT_SHADER, _),
                  T = I.createProgram();
                if (
                  (I.attachShader(T, R),
                  I.attachShader(T, A),
                  I.linkProgram(T),
                  !I.getProgramParameter(T, I.LINK_STATUS))
                ) {
                  var O = I.getProgramInfoLog(T);
                  throw (I.deleteProgram(T), new Error('GL program linking failed: ' + O));
                }
                return T;
              }
              return (
                (O.drawFrame = function (N) {
                  var i = N.format,
                    o = !_ || E.width !== i.displayWidth || E.height !== i.displayHeight;
                  if (
                    (o && ((E.width = i.displayWidth), (E.height = i.displayHeight), O.clear()),
                    _ ||
                      (function () {
                        if (T.stripe) {
                          (R = c(A.vertexStripe, A.fragmentStripe)),
                            I.getAttribLocation(R, 'aPosition'),
                            (L = I.createBuffer());
                          var E = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
                          I.bindBuffer(I.ARRAY_BUFFER, L),
                            I.bufferData(I.ARRAY_BUFFER, E, I.STATIC_DRAW),
                            (e = I.getAttribLocation(R, 'aTexturePosition')),
                            (C = I.getUniformLocation(R, 'uStripe')),
                            (t = I.getUniformLocation(R, 'uTexture'));
                        }
                        (_ = c(A.vertex, A.fragment)),
                          (D = I.createBuffer()),
                          I.bindBuffer(I.ARRAY_BUFFER, D),
                          I.bufferData(I.ARRAY_BUFFER, r, I.STATIC_DRAW),
                          (S = I.getAttribLocation(_, 'aPosition')),
                          (P = I.createBuffer()),
                          (U = I.getAttribLocation(_, 'aLumaPosition')),
                          (n = I.createBuffer()),
                          (M = I.getAttribLocation(_, 'aChromaPosition'));
                      })(),
                    o)
                  ) {
                    var V = function (E, _, R) {
                      var A = i.cropLeft / R,
                        T = (i.cropLeft + i.cropWidth) / R,
                        O = (i.cropTop + i.cropHeight) / i.height,
                        N = i.cropTop / i.height,
                        D = new Float32Array([A, O, T, O, A, N, A, N, T, O, T, N]);
                      I.bindBuffer(I.ARRAY_BUFFER, E),
                        I.bufferData(I.ARRAY_BUFFER, D, I.STATIC_DRAW);
                    };
                    V(P, 0, N.y.stride), V(n, 0, (N.u.stride * i.width) / i.chromaWidth);
                  }
                  u('uTextureY', N.y.stride, i.height, N.y.bytes),
                    u('uTextureCb', N.u.stride, i.chromaHeight, N.u.bytes),
                    u('uTextureCr', N.v.stride, i.chromaHeight, N.v.bytes),
                    T.stripe &&
                      (F('uTextureY', N.y.stride, i.height),
                      F('uTextureCb', N.u.stride, i.chromaHeight),
                      F('uTextureCr', N.v.stride, i.chromaHeight)),
                    I.useProgram(_),
                    I.viewport(0, 0, E.width, E.height),
                    G('uTextureY', I.TEXTURE0, 0),
                    G('uTextureCb', I.TEXTURE1, 1),
                    G('uTextureCr', I.TEXTURE2, 2),
                    I.bindBuffer(I.ARRAY_BUFFER, D),
                    I.enableVertexAttribArray(S),
                    I.vertexAttribPointer(S, 2, I.FLOAT, !1, 0, 0),
                    I.bindBuffer(I.ARRAY_BUFFER, P),
                    I.enableVertexAttribArray(U),
                    I.vertexAttribPointer(U, 2, I.FLOAT, !1, 0, 0),
                    I.bindBuffer(I.ARRAY_BUFFER, n),
                    I.enableVertexAttribArray(M),
                    I.vertexAttribPointer(M, 2, I.FLOAT, !1, 0, 0),
                    I.drawArrays(I.TRIANGLES, 0, r.length / 2);
                }),
                (O.clear = function () {
                  I.viewport(0, 0, E.width, E.height),
                    I.clearColor(0, 0, 0, 0),
                    I.clear(I.COLOR_BUFFER_BIT);
                }),
                O.clear(),
                O
              );
            }
            (T.stripe = -1 !== navigator.userAgent.indexOf('Windows')),
              (T.contextForCanvas = function (E) {
                var _ = {
                  preferLowPowerToHighPerformance: !0,
                  powerPreference: 'low-power',
                  failIfMajorPerformanceCaveat: !0,
                  preserveDrawingBuffer: !0,
                };
                return E.getContext('webgl', _) || E.getContext('experimental-webgl', _);
              }),
              (T.isAvailable = function () {
                var E,
                  _ = document.createElement('canvas');
                (_.width = 1), (_.height = 1);
                try {
                  E = T.contextForCanvas(_);
                } catch (E) {
                  return !1;
                }
                if (E) {
                  var R = E.TEXTURE0,
                    A = E.createTexture(),
                    O = new Uint8Array(16),
                    I = T.stripe ? 1 : 4,
                    N = T.stripe ? E.RGBA : E.LUMINANCE,
                    D = T.stripe ? E.NEAREST : E.LINEAR;
                  return (
                    E.activeTexture(R),
                    E.bindTexture(E.TEXTURE_2D, A),
                    E.texParameteri(E.TEXTURE_2D, E.TEXTURE_WRAP_S, E.CLAMP_TO_EDGE),
                    E.texParameteri(E.TEXTURE_2D, E.TEXTURE_WRAP_T, E.CLAMP_TO_EDGE),
                    E.texParameteri(E.TEXTURE_2D, E.TEXTURE_MIN_FILTER, D),
                    E.texParameteri(E.TEXTURE_2D, E.TEXTURE_MAG_FILTER, D),
                    E.texImage2D(E.TEXTURE_2D, 0, N, I, 4, 0, N, E.UNSIGNED_BYTE, O),
                    !E.getError()
                  );
                }
                return !1;
              }),
              (T.prototype = Object.create(_.prototype)),
              (E.exports = T);
          })();
        },
        627: function (E, _, R) {
          !(function () {
            'use strict';
            var _ = R(877);
            E.exports = {
              convertYCbCr: function (E, R) {
                var A = 0 | E.format.width,
                  T = 0 | E.format.height,
                  O = 0 | _(E.format.width / E.format.chromaWidth),
                  I = 0 | _(E.format.height / E.format.chromaHeight),
                  N = E.y.bytes,
                  D = E.u.bytes,
                  S = E.v.bytes,
                  L = 0 | E.y.stride,
                  e = 0 | E.u.stride,
                  C = 0 | E.v.stride,
                  t = A << 2,
                  P = 0,
                  U = 0,
                  n = 0,
                  M = 0,
                  r = 0,
                  i = 0,
                  o = 0,
                  V = 0,
                  a = 0,
                  u = 0,
                  F = 0,
                  G = 0,
                  c = 0,
                  s = 0,
                  B = 0,
                  d = 0,
                  f = 0,
                  Y = 0;
                if (1 == O && 1 == I)
                  for (o = 0, V = t, Y = 0, d = 0; d < T; d += 2) {
                    for (
                      n = ((U = (d * L) | 0) + L) | 0, M = (Y * e) | 0, r = (Y * C) | 0, B = 0;
                      B < A;
                      B += 2
                    )
                      (a = 0 | D[M++]),
                        (G = (((409 * (u = 0 | S[r++])) | 0) - 57088) | 0),
                        (c = (((100 * a) | 0) + ((208 * u) | 0) - 34816) | 0),
                        (s = (((516 * a) | 0) - 70912) | 0),
                        (F = (298 * N[U++]) | 0),
                        (R[o] = (F + G) >> 8),
                        (R[o + 1] = (F - c) >> 8),
                        (R[o + 2] = (F + s) >> 8),
                        (o += 4),
                        (F = (298 * N[U++]) | 0),
                        (R[o] = (F + G) >> 8),
                        (R[o + 1] = (F - c) >> 8),
                        (R[o + 2] = (F + s) >> 8),
                        (o += 4),
                        (F = (298 * N[n++]) | 0),
                        (R[V] = (F + G) >> 8),
                        (R[V + 1] = (F - c) >> 8),
                        (R[V + 2] = (F + s) >> 8),
                        (V += 4),
                        (F = (298 * N[n++]) | 0),
                        (R[V] = (F + G) >> 8),
                        (R[V + 1] = (F - c) >> 8),
                        (R[V + 2] = (F + s) >> 8),
                        (V += 4);
                    (o += t), (V += t), Y++;
                  }
                else
                  for (i = 0, d = 0; d < T; d++)
                    for (
                      f = 0, P = (d * L) | 0, M = ((Y = d >> I) * e) | 0, r = (Y * C) | 0, B = 0;
                      B < A;
                      B++
                    )
                      (a = 0 | D[M + (f = B >> O)]),
                        (G = (((409 * (u = 0 | S[r + f])) | 0) - 57088) | 0),
                        (c = (((100 * a) | 0) + ((208 * u) | 0) - 34816) | 0),
                        (s = (((516 * a) | 0) - 70912) | 0),
                        (F = (298 * N[P++]) | 0),
                        (R[i] = (F + G) >> 8),
                        (R[i + 1] = (F - c) >> 8),
                        (R[i + 2] = (F + s) >> 8),
                        (i += 4);
              },
            };
          })();
        },
        877: function (E) {
          !(function () {
            'use strict';
            E.exports = function (E) {
              for (var _ = 0, R = E >> 1; 0 != R; ) (R >>= 1), _++;
              if (E !== 1 << _)
                throw (
                  'chroma plane dimensions must be power of 2 ratio to luma plane dimensions; got ' +
                  E
                );
              return _;
            };
          })();
        },
        731: function (E, _, R) {
          !(function () {
            'use strict';
            var _ = R(487),
              A = R(926),
              T = R(895),
              O = {
                FrameSink: _,
                SoftwareFrameSink: A,
                WebGLFrameSink: T,
                attach: function (E, _) {
                  return ('webGL' in (_ = _ || {}) ? _.webGL : T.isAvailable())
                    ? new T(E, _)
                    : new A(E, _);
                },
              };
            E.exports = O;
          })();
        },
      },
      _ = {};
    function R(A) {
      var T = _[A];
      if (void 0 !== T) return T.exports;
      var O = (_[A] = { exports: {} });
      return E[A](O, O.exports, R), O.exports;
    }
    (R.d = function (E, _) {
      for (var A in _)
        R.o(_, A) && !R.o(E, A) && Object.defineProperty(E, A, { enumerable: !0, get: _[A] });
    }),
      (R.o = function (E, _) {
        return Object.prototype.hasOwnProperty.call(E, _);
      }),
      (R.r = function (E) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(E, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(E, '__esModule', { value: !0 });
      });
    var A = {};
    return (
      (function () {
        'use strict';
        R.r(A),
          R.d(A, {
            AgoraRtcEngine: function () {
              return N;
            },
          });
        var E = function (E, _) {
            for (var R = 0, A = _.length, T = E.length; R < A; R++, T++) E[T] = _[R];
            return E;
          },
          _ = R(731);
        _.WebGLFrameSink.stripe = !1;
        var T,
          O,
          I,
          N,
          D = R(662);
        function S(E, _, R) {
          return (
            void 0 === _ && (_ = {}), window.agoraBridge.callNativeMethod(E, JSON.stringify(_), R)
          );
        }
        function L(E, _) {
          return (
            void 0 === _ && (_ = {}),
            window.agoraBridge.callNativeMethodAudioEffect(E, JSON.stringify(_))
          );
        }
        function e(E, _) {
          return (
            void 0 === _ && (_ = {}),
            window.agoraBridge.callNativeMethodPlayback(E, JSON.stringify(_))
          );
        }
        function C(E, _) {
          return (
            void 0 === _ && (_ = {}),
            window.agoraBridge.callNativeMethodRecording(E, JSON.stringify(_))
          );
        }
        function t(E, _) {
          return (
            void 0 === _ && (_ = {}), window.agoraBridge.callNativeMethodVideo(E, JSON.stringify(_))
          );
        }
        !(function (E) {
          (E[(E.INITIALIZE = 0)] = 'INITIALIZE'),
            (E[(E.RELEASE = 1)] = 'RELEASE'),
            (E[(E.SET_CHANNEL_PROFILE = 2)] = 'SET_CHANNEL_PROFILE'),
            (E[(E.SET_CLIENT_ROLE = 3)] = 'SET_CLIENT_ROLE'),
            (E[(E.JOIN_CHANNEL = 4)] = 'JOIN_CHANNEL'),
            (E[(E.SWITCH_CHANNEL = 5)] = 'SWITCH_CHANNEL'),
            (E[(E.LEAVE_CHANNEL = 6)] = 'LEAVE_CHANNEL'),
            (E[(E.RE_NEW_TOKEN = 7)] = 'RE_NEW_TOKEN'),
            (E[(E.REGISTER_LOCAL_USER_ACCOUNT = 8)] = 'REGISTER_LOCAL_USER_ACCOUNT'),
            (E[(E.JOIN_CHANNEL_WITH_USER_ACCOUNT = 9)] = 'JOIN_CHANNEL_WITH_USER_ACCOUNT'),
            (E[(E.GET_USER_INFO_BY_USER_ACCOUNT = 10)] = 'GET_USER_INFO_BY_USER_ACCOUNT'),
            (E[(E.GET_USER_INFO_BY_UID = 11)] = 'GET_USER_INFO_BY_UID'),
            (E[(E.START_ECHO_TEST = 12)] = 'START_ECHO_TEST'),
            (E[(E.START_ECHO_TEST_2 = 13)] = 'START_ECHO_TEST_2'),
            (E[(E.STOP_ECHO_TEST = 14)] = 'STOP_ECHO_TEST'),
            (E[(E.ENABLE_VIDEO = 15)] = 'ENABLE_VIDEO'),
            (E[(E.DISABLE_VIDEO = 16)] = 'DISABLE_VIDEO'),
            (E[(E.SET_VIDEO_PROFILE = 17)] = 'SET_VIDEO_PROFILE'),
            (E[(E.SET_VIDEO_ENCODER_CONFIGURATION = 18)] = 'SET_VIDEO_ENCODER_CONFIGURATION'),
            (E[(E.SET_CAMERA_CAPTURER_CONFIGURATION = 19)] = 'SET_CAMERA_CAPTURER_CONFIGURATION'),
            (E[(E.SET_UP_LOCAL_VIDEO = 20)] = 'SET_UP_LOCAL_VIDEO'),
            (E[(E.SET_UP_REMOTE_VIDEO = 21)] = 'SET_UP_REMOTE_VIDEO'),
            (E[(E.START_PREVIEW = 22)] = 'START_PREVIEW'),
            (E[(E.SET_REMOTE_USER_PRIORITY = 23)] = 'SET_REMOTE_USER_PRIORITY'),
            (E[(E.STOP_PREVIEW = 24)] = 'STOP_PREVIEW'),
            (E[(E.ENABLE_AUDIO = 25)] = 'ENABLE_AUDIO'),
            (E[(E.ENABLE_LOCAL_AUDIO = 26)] = 'ENABLE_LOCAL_AUDIO'),
            (E[(E.DISABLE_AUDIO = 27)] = 'DISABLE_AUDIO'),
            (E[(E.SET_AUDIO_PROFILE = 28)] = 'SET_AUDIO_PROFILE'),
            (E[(E.MUTE_LOCAL_AUDIO_STREAM = 29)] = 'MUTE_LOCAL_AUDIO_STREAM'),
            (E[(E.MUTE_ALL_REMOTE_AUDIO_STREAMS = 30)] = 'MUTE_ALL_REMOTE_AUDIO_STREAMS'),
            (E[(E.SET_DEFAULT_MUTE_ALL_REMOTE_AUDIO_STREAMS = 31)] =
              'SET_DEFAULT_MUTE_ALL_REMOTE_AUDIO_STREAMS'),
            (E[(E.ADJUST_USER_PLAYBACK_SIGNAL_VOLUME = 32)] = 'ADJUST_USER_PLAYBACK_SIGNAL_VOLUME'),
            (E[(E.MUTE_REMOTE_AUDIO_STREAM = 33)] = 'MUTE_REMOTE_AUDIO_STREAM'),
            (E[(E.MUTE_LOCAL_VIDEO_STREAM = 34)] = 'MUTE_LOCAL_VIDEO_STREAM'),
            (E[(E.ENABLE_LOCAL_VIDEO = 35)] = 'ENABLE_LOCAL_VIDEO'),
            (E[(E.MUTE_ALL_REMOTE_VIDEO_STREAMS = 36)] = 'MUTE_ALL_REMOTE_VIDEO_STREAMS'),
            (E[(E.SET_DEFAULT_MUTE_ALL_REMOTE_VIDEO_STREAMS = 37)] =
              'SET_DEFAULT_MUTE_ALL_REMOTE_VIDEO_STREAMS'),
            (E[(E.MUTE_REMOTE_VIDEO_STREAM = 38)] = 'MUTE_REMOTE_VIDEO_STREAM'),
            (E[(E.SET_REMOTE_VIDEO_STREAM_TYPE = 39)] = 'SET_REMOTE_VIDEO_STREAM_TYPE'),
            (E[(E.SET_REMOTE_DEFAULT_VIDEO_STREAM_TYPE = 40)] =
              'SET_REMOTE_DEFAULT_VIDEO_STREAM_TYPE'),
            (E[(E.ENABLE_AUDIO_VOLUME_INDICATION = 41)] = 'ENABLE_AUDIO_VOLUME_INDICATION'),
            (E[(E.START_AUDIO_RECORDING = 42)] = 'START_AUDIO_RECORDING'),
            (E[(E.START_AUDIO_RECORDING2 = 43)] = 'START_AUDIO_RECORDING2'),
            (E[(E.STOP_AUDIO_RECORDING = 44)] = 'STOP_AUDIO_RECORDING'),
            (E[(E.ENABLE_FACE_DETECTION = 62)] = 'ENABLE_FACE_DETECTION'),
            (E[(E.SET_REMOTE_VOICE_POSITIONN = 73)] = 'SET_REMOTE_VOICE_POSITIONN'),
            (E[(E.SET_LOG_FILE = 79)] = 'SET_LOG_FILE'),
            (E[(E.SET_LOG_FILTER = 80)] = 'SET_LOG_FILTER'),
            (E[(E.SET_LOG_FILE_SIZE = 81)] = 'SET_LOG_FILE_SIZE'),
            (E[(E.SET_LOCAL_RENDER_MODE = 82)] = 'SET_LOCAL_RENDER_MODE'),
            (E[(E.SET_LOCAL_RENDER_MODE_2 = 83)] = 'SET_LOCAL_RENDER_MODE_2'),
            (E[(E.SET_REMOTE_RENDER_MODE = 84)] = 'SET_REMOTE_RENDER_MODE'),
            (E[(E.SET_REMOTE_RENDER_MODE_2 = 85)] = 'SET_REMOTE_RENDER_MODE_2'),
            (E[(E.SET_LOCAL_VIDEO_MIRROR_MODE = 86)] = 'SET_LOCAL_VIDEO_MIRROR_MODE'),
            (E[(E.ENABLE_DUAL_STREAM_MODE = 87)] = 'ENABLE_DUAL_STREAM_MODE'),
            (E[(E.ADJUST_RECORDING_SIGNAL_VOLUME = 93)] = 'ADJUST_RECORDING_SIGNAL_VOLUME'),
            (E[(E.ADJUST_PLAYBACK_SIGNAL_VOLUME = 94)] = 'ADJUST_PLAYBACK_SIGNAL_VOLUME'),
            (E[(E.ENABLE_WEB_SDK_INTEROPER_ABILITY = 95)] = 'ENABLE_WEB_SDK_INTEROPER_ABILITY'),
            (E[(E.SET_VIDEO_QUALITY_PARAMETERS = 96)] = 'SET_VIDEO_QUALITY_PARAMETERS'),
            (E[(E.SET_LOCAL_PUBLISH_FALLBACK_OPTION = 97)] = 'SET_LOCAL_PUBLISH_FALLBACK_OPTION'),
            (E[(E.SET_REMOTE_SUBSCRIBE_FALLBACK_OPTION = 98)] =
              'SET_REMOTE_SUBSCRIBE_FALLBACK_OPTION'),
            (E[(E.SWITCH_CAMERA = 99)] = 'SWITCH_CAMERA'),
            (E[(E.SWITCH_CAMERA_2 = 100)] = 'SWITCH_CAMERA_2'),
            (E[(E.SET_DEFAULT_AUDIO_ROUTE_SPEAKER_PHONE = 101)] =
              'SET_DEFAULT_AUDIO_ROUTE_SPEAKER_PHONE'),
            (E[(E.SET_ENABLE_SPEAKER_PHONE = 102)] = 'SET_ENABLE_SPEAKER_PHONE'),
            (E[(E.ENABLE_IN_EAR_MONITORING = 103)] = 'ENABLE_IN_EAR_MONITORING'),
            (E[(E.SET_IN_EAR_MONITORING_VOLUME = 104)] = 'SET_IN_EAR_MONITORING_VOLUME'),
            (E[(E.IS_SPEAKER_PHONE_ENABLED = 105)] = 'IS_SPEAKER_PHONE_ENABLED'),
            (E[(E.SET_AUDIO_SESSION_OPERATION_RESTRICTION = 106)] =
              'SET_AUDIO_SESSION_OPERATION_RESTRICTION'),
            (E[(E.ENABLE_LOOP_BACK_RECORDING = 107)] = 'ENABLE_LOOP_BACK_RECORDING'),
            (E[(E.START_SCREEN_CAPTURE_BY_DISPLAY_ID = 108)] =
              'START_SCREEN_CAPTURE_BY_DISPLAY_ID'),
            (E[(E.START_SCREEN_CAPTURE_BY_SCREEN_RECT = 109)] =
              'START_SCREEN_CAPTURE_BY_SCREEN_RECT'),
            (E[(E.START_SCREEN_CAPTURE_BY_WINDOW_ID = 110)] = 'START_SCREEN_CAPTURE_BY_WINDOW_ID'),
            (E[(E.SET_SCREEN_CAPTURE_CONTENT_HINT = 111)] = 'SET_SCREEN_CAPTURE_CONTENT_HINT'),
            (E[(E.UPDATE_SCREEN_CAPTURE_PARAMETERS = 112)] = 'UPDATE_SCREEN_CAPTURE_PARAMETERS'),
            (E[(E.UPDATE_SCREEN_CAPTURE_REGION = 113)] = 'UPDATE_SCREEN_CAPTURE_REGION'),
            (E[(E.STOP_SCREEN_CAPTURE = 114)] = 'STOP_SCREEN_CAPTURE'),
            (E[(E.GET_CALL_ID = 117)] = 'GET_CALL_ID'),
            (E[(E.RATE = 118)] = 'RATE'),
            (E[(E.COMPLAIN = 119)] = 'COMPLAIN'),
            (E[(E.GET_VERSION = 120)] = 'GET_VERSION'),
            (E[(E.ENABLE_LAST_MILE_TEST = 121)] = 'ENABLE_LAST_MILE_TEST'),
            (E[(E.DISABLE_LAST_MILE_TEST = 122)] = 'DISABLE_LAST_MILE_TEST'),
            (E[(E.START_LAST_MILE_PROBE_TEST = 123)] = 'START_LAST_MILE_PROBE_TEST'),
            (E[(E.STOP_LAST_MILE_PROBE_TEST = 124)] = 'STOP_LAST_MILE_PROBE_TEST'),
            (E[(E.GET_ERROR_DESCRIPTION = 125)] = 'GET_ERROR_DESCRIPTION'),
            (E[(E.SET_ENCRYPTION_SECTRT = 126)] = 'SET_ENCRYPTION_SECTRT'),
            (E[(E.SET_ENCRYPTION_MODE = 127)] = 'SET_ENCRYPTION_MODE'),
            (E[(E.REGISTER_PACKET_OBSERVER = 128)] = 'REGISTER_PACKET_OBSERVER'),
            (E[(E.CREATE_DATA_STREAM = 129)] = 'CREATE_DATA_STREAM'),
            (E[(E.SEND_STREAM_MESSAGE = 130)] = 'SEND_STREAM_MESSAGE'),
            (E[(E.ADD_PUBLISH_STREAM_URL = 131)] = 'ADD_PUBLISH_STREAM_URL'),
            (E[(E.REMOVE_PUBLISH_STREAM_URL = 132)] = 'REMOVE_PUBLISH_STREAM_URL'),
            (E[(E.SET_LIVE_TRANSCODING = 133)] = 'SET_LIVE_TRANSCODING'),
            (E[(E.ADD_VIDEO_WATER_MARK = 134)] = 'ADD_VIDEO_WATER_MARK'),
            (E[(E.ADD_VIDEO_WATER_MARK_2 = 135)] = 'ADD_VIDEO_WATER_MARK_2'),
            (E[(E.CLEAR_VIDEO_WATER_MARKS = 136)] = 'CLEAR_VIDEO_WATER_MARKS'),
            (E[(E.SET_BEAUTY_EFFECT_OPTIONS = 137)] = 'SET_BEAUTY_EFFECT_OPTIONS'),
            (E[(E.ADD_INJECT_STREAM_URL = 138)] = 'ADD_INJECT_STREAM_URL'),
            (E[(E.START_CHANNEL_MEDIA_RELAY = 139)] = 'START_CHANNEL_MEDIA_RELAY'),
            (E[(E.UPDATE_CHANNEL_MEDIA_RELAY = 140)] = 'UPDATE_CHANNEL_MEDIA_RELAY'),
            (E[(E.STOP_CHANNEL_MEDIA_RELAY = 141)] = 'STOP_CHANNEL_MEDIA_RELAY'),
            (E[(E.REMOVE_INJECT_STREAM_URL = 142)] = 'REMOVE_INJECT_STREAM_URL'),
            (E[(E.GET_CONNECTION_STATE = 143)] = 'GET_CONNECTION_STATE'),
            (E[(E.REGISTER_MEDIA_META_DATA_OBSERVER = 144)] = 'REGISTER_MEDIA_META_DATA_OBSERVER'),
            (E[(E.SET_PARAMETERS = 145)] = 'SET_PARAMETERS'),
            (E[(E.SET_PLAYBACK_DEVICE_VOLUME = 146)] = 'SET_PLAYBACK_DEVICE_VOLUME'),
            (E[(E.PUBLISH = 147)] = 'PUBLISH'),
            (E[(E.UNPUBLISH = 148)] = 'UNPUBLISH'),
            (E[(E.CHANNEL_ID = 149)] = 'CHANNEL_ID'),
            (E[(E.SEND_METADATA = 150)] = 'SEND_METADATA'),
            (E[(E.SET_MAX_META_SIZE = 151)] = 'SET_MAX_META_SIZE'),
            (E[(E.PUSH_AUDIO_FRAME = 152)] = 'PUSH_AUDIO_FRAME'),
            (E[(E.PUSH_AUDIO_FRAME_2 = 153)] = 'PUSH_AUDIO_FRAME_2'),
            (E[(E.PULL_AUDIO_FRAME = 154)] = 'PULL_AUDIO_FRAME'),
            (E[(E.SET_EXTERN_VIDEO_SOURCE = 155)] = 'SET_EXTERN_VIDEO_SOURCE'),
            (E[(E.PUSH_VIDEO_FRAME = 156)] = 'PUSH_VIDEO_FRAME'),
            (E[(E.ENABLE_ENCRYPTION = 157)] = 'ENABLE_ENCRYPTION'),
            (E[(E.SEND_CUSTOM_REPORT_MESSAGE = 158)] = 'SEND_CUSTOM_REPORT_MESSAGE'),
            (E[(E.REGISTER_VIDEO_FRAME_OBSERVER = 159)] = 'REGISTER_VIDEO_FRAME_OBSERVER'),
            (E[(E.ENABLE_REMOTE_SUPER_RESOLUTION = 160)] = 'ENABLE_REMOTE_SUPER_RESOLUTION');
        })(T || (T = {})),
          (function (E) {
            (E[(E.START_AUDIO_MIXING = 45)] = 'START_AUDIO_MIXING'),
              (E[(E.STOP_AUDIO_MIXING = 46)] = 'STOP_AUDIO_MIXING'),
              (E[(E.PAUSE_AUDIO_MIXING = 47)] = 'PAUSE_AUDIO_MIXING'),
              (E[(E.RESUME_AUDIO_MIXING = 48)] = 'RESUME_AUDIO_MIXING'),
              (E[(E.SET_HIGH_QUALITY_AUDIO_PARAMETERS = 49)] = 'SET_HIGH_QUALITY_AUDIO_PARAMETERS'),
              (E[(E.ADJUST_AUDIO_MIXING_VOLUME = 50)] = 'ADJUST_AUDIO_MIXING_VOLUME'),
              (E[(E.ADJUST_AUDIO_MIXING_PLAYOUT_VOLUME = 51)] =
                'ADJUST_AUDIO_MIXING_PLAYOUT_VOLUME'),
              (E[(E.GET_AUDIO_MIXING_PLAYOUT_VOLUME = 52)] = 'GET_AUDIO_MIXING_PLAYOUT_VOLUME'),
              (E[(E.ADJUST_AUDIO_MIXING_PUBLISH_VOLUME = 53)] =
                'ADJUST_AUDIO_MIXING_PUBLISH_VOLUME'),
              (E[(E.GET_AUDIO_MIXING_PUBLISH_VOLUME = 54)] = 'GET_AUDIO_MIXING_PUBLISH_VOLUME'),
              (E[(E.GET_AUDIO_MIXING_DURATION = 55)] = 'GET_AUDIO_MIXING_DURATION'),
              (E[(E.GET_AUDIO_MIXING_CURRENT_POSITION = 56)] = 'GET_AUDIO_MIXING_CURRENT_POSITION'),
              (E[(E.SET_AUDIO_MIXING_POSITION = 57)] = 'SET_AUDIO_MIXING_POSITION'),
              (E[(E.SET_AUDIO_MIXING_PITCH = 58)] = 'SET_AUDIO_MIXING_PITCH'),
              (E[(E.GET_EFFECTS_VOLUME = 59)] = 'GET_EFFECTS_VOLUME'),
              (E[(E.SET_EFFECTS_VOLUME = 60)] = 'SET_EFFECTS_VOLUME'),
              (E[(E.SET_VOLUME_OF_EFFECT = 61)] = 'SET_VOLUME_OF_EFFECT'),
              (E[(E.PLAY_EFFECT = 63)] = 'PLAY_EFFECT'),
              (E[(E.STOP_EFFECT = 64)] = 'STOP_EFFECT'),
              (E[(E.STOP_ALL_EFFECTS = 65)] = 'STOP_ALL_EFFECTS'),
              (E[(E.PRE_LOAD_EFFECT = 66)] = 'PRE_LOAD_EFFECT'),
              (E[(E.UN_LOAD_EFFECT = 67)] = 'UN_LOAD_EFFECT'),
              (E[(E.PAUSE_EFFECT = 68)] = 'PAUSE_EFFECT'),
              (E[(E.PAUSE_ALL_EFFECTS = 69)] = 'PAUSE_ALL_EFFECTS'),
              (E[(E.RESUME_EFFECT = 70)] = 'RESUME_EFFECT'),
              (E[(E.RESUME_ALL_EFFECTS = 71)] = 'RESUME_ALL_EFFECTS'),
              (E[(E.ENABLE_SOUND_POSITION_INDICATION = 72)] = 'ENABLE_SOUND_POSITION_INDICATION'),
              (E[(E.SET_LOCAL_VOICE_PITCH = 74)] = 'SET_LOCAL_VOICE_PITCH'),
              (E[(E.SET_LOCAL_VOICE_EQUALIZATION = 75)] = 'SET_LOCAL_VOICE_EQUALIZATION'),
              (E[(E.SET_LOCAL_VOICE_REVERB = 76)] = 'SET_LOCAL_VOICE_REVERB'),
              (E[(E.SET_LOCAL_VOICE_CHANGER = 77)] = 'SET_LOCAL_VOICE_CHANGER'),
              (E[(E.SET_LOCAL_VOICE_REVERB_PRESET = 78)] = 'SET_LOCAL_VOICE_REVERB_PRESET'),
              (E[(E.SET_EXTERNAL_AUDIO_SOURCE = 88)] = 'SET_EXTERNAL_AUDIO_SOURCE'),
              (E[(E.SET_EXTERNAL_AUDIO_SINK = 89)] = 'SET_EXTERNAL_AUDIO_SINK'),
              (E[(E.SET_RECORDING_AUDIO_FRAME_PARAMETERS = 90)] =
                'SET_RECORDING_AUDIO_FRAME_PARAMETERS'),
              (E[(E.SET_PLAYBACK_AUDIO_FRAME_PARAMETERS = 91)] =
                'SET_PLAYBACK_AUDIO_FRAME_PARAMETERS'),
              (E[(E.SET_MIXED_AUDIO_FRAME_PARAMETERS = 92)] = 'SET_MIXED_AUDIO_FRAME_PARAMETERS'),
              (E[(E.SET_VOICE_BEAUTIFIER_PRESET = 93)] = 'SET_VOICE_BEAUTIFIER_PRESET'),
              (E[(E.SET_AUDIO_EFFECT_PRESET = 94)] = 'SET_AUDIO_EFFECT_PRESET'),
              (E[(E.SET_AUDIO_EFFECT_PARAMETERS = 95)] = 'SET_AUDIO_EFFECT_PARAMETERS');
          })(O || (O = {})),
          (function (E) {
            (E[(E.GET_COUNT = 151)] = 'GET_COUNT'),
              (E[(E.GET_DEVICE = 152)] = 'GET_DEVICE'),
              (E[(E.GET_CURRENT_DEVICE = 153)] = 'GET_CURRENT_DEVICE'),
              (E[(E.GET_CURRENT_DEVICE_INFO = 154)] = 'GET_CURRENT_DEVICE_INFO'),
              (E[(E.SET_DEVICE = 155)] = 'SET_DEVICE'),
              (E[(E.SET_DEVICE_VOLUME = 156)] = 'SET_DEVICE_VOLUME'),
              (E[(E.GET_DEVICE_VOLUME = 157)] = 'GET_DEVICE_VOLUME'),
              (E[(E.SET_DEVICE_MUTE = 158)] = 'SET_DEVICE_MUTE'),
              (E[(E.GET_DEVICE_MUTE = 159)] = 'GET_DEVICE_MUTE'),
              (E[(E.START_DEVICE_TEST = 160)] = 'START_DEVICE_TEST'),
              (E[(E.STOP_DEVICE_TEST = 161)] = 'STOP_DEVICE_TEST'),
              (E[(E.START_AUDIO_DEVICE_LOOP_BACK_TEST = 162)] =
                'START_AUDIO_DEVICE_LOOP_BACK_TEST'),
              (E[(E.STOP_AUDIO_DEVICE_LOOP_BACK_TEST = 163)] = 'STOP_AUDIO_DEVICE_LOOP_BACK_TEST');
          })(I || (I = {})),
          (function (E) {
            var _, R, A, T;
            ((T = E.INTERFACE_ID_TYPE || (E.INTERFACE_ID_TYPE = {}))[
              (T.AGORA_IID_AUDIO_DEVICE_MANAGER = 1)
            ] = 'AGORA_IID_AUDIO_DEVICE_MANAGER'),
              (T[(T.AGORA_IID_VIDEO_DEVICE_MANAGER = 2)] = 'AGORA_IID_VIDEO_DEVICE_MANAGER'),
              (T[(T.AGORA_IID_RTC_ENGINE_PARAMETER = 3)] = 'AGORA_IID_RTC_ENGINE_PARAMETER'),
              (T[(T.AGORA_IID_MEDIA_ENGINE = 4)] = 'AGORA_IID_MEDIA_ENGINE'),
              (T[(T.AGORA_IID_SIGNALING_ENGINE = 8)] = 'AGORA_IID_SIGNALING_ENGINE'),
              ((A = E.WARN_CODE_TYPE || (E.WARN_CODE_TYPE = {}))[(A.WARN_INVALID_VIEW = 8)] =
                'WARN_INVALID_VIEW'),
              (A[(A.WARN_INIT_VIDEO = 16)] = 'WARN_INIT_VIDEO'),
              (A[(A.WARN_PENDING = 20)] = 'WARN_PENDING'),
              (A[(A.WARN_NO_AVAILABLE_CHANNEL = 103)] = 'WARN_NO_AVAILABLE_CHANNEL'),
              (A[(A.WARN_LOOKUP_CHANNEL_TIMEOUT = 104)] = 'WARN_LOOKUP_CHANNEL_TIMEOUT'),
              (A[(A.WARN_LOOKUP_CHANNEL_REJECTED = 105)] = 'WARN_LOOKUP_CHANNEL_REJECTED'),
              (A[(A.WARN_OPEN_CHANNEL_TIMEOUT = 106)] = 'WARN_OPEN_CHANNEL_TIMEOUT'),
              (A[(A.WARN_OPEN_CHANNEL_REJECTED = 107)] = 'WARN_OPEN_CHANNEL_REJECTED'),
              (A[(A.WARN_SWITCH_LIVE_VIDEO_TIMEOUT = 111)] = 'WARN_SWITCH_LIVE_VIDEO_TIMEOUT'),
              (A[(A.WARN_SET_CLIENT_ROLE_TIMEOUT = 118)] = 'WARN_SET_CLIENT_ROLE_TIMEOUT'),
              (A[(A.WARN_OPEN_CHANNEL_INVALID_TICKET = 121)] = 'WARN_OPEN_CHANNEL_INVALID_TICKET'),
              (A[(A.WARN_OPEN_CHANNEL_TRY_NEXT_VOS = 122)] = 'WARN_OPEN_CHANNEL_TRY_NEXT_VOS'),
              (A[(A.WARN_CHANNEL_CONNECTION_UNRECOVERABLE = 131)] =
                'WARN_CHANNEL_CONNECTION_UNRECOVERABLE'),
              (A[(A.WARN_CHANNEL_CONNECTION_IP_CHANGED = 132)] =
                'WARN_CHANNEL_CONNECTION_IP_CHANGED'),
              (A[(A.WARN_CHANNEL_CONNECTION_PORT_CHANGED = 133)] =
                'WARN_CHANNEL_CONNECTION_PORT_CHANGED'),
              (A[(A.WARN_AUDIO_MIXING_OPEN_ERROR = 701)] = 'WARN_AUDIO_MIXING_OPEN_ERROR'),
              (A[(A.WARN_ADM_RUNTIME_PLAYOUT_WARNING = 1014)] = 'WARN_ADM_RUNTIME_PLAYOUT_WARNING'),
              (A[(A.WARN_ADM_RUNTIME_RECORDING_WARNING = 1016)] =
                'WARN_ADM_RUNTIME_RECORDING_WARNING'),
              (A[(A.WARN_ADM_RECORD_AUDIO_SILENCE = 1019)] = 'WARN_ADM_RECORD_AUDIO_SILENCE'),
              (A[(A.WARN_ADM_PLAYOUT_MALFUNCTION = 1020)] = 'WARN_ADM_PLAYOUT_MALFUNCTION'),
              (A[(A.WARN_ADM_RECORD_MALFUNCTION = 1021)] = 'WARN_ADM_RECORD_MALFUNCTION'),
              (A[(A.WARN_ADM_CALL_INTERRUPTION = 1025)] = 'WARN_ADM_CALL_INTERRUPTION'),
              (A[(A.WARN_ADM_IOS_CATEGORY_NOT_PLAYANDRECORD = 1029)] =
                'WARN_ADM_IOS_CATEGORY_NOT_PLAYANDRECORD'),
              (A[(A.WARN_ADM_RECORD_AUDIO_LOWLEVEL = 1031)] = 'WARN_ADM_RECORD_AUDIO_LOWLEVEL'),
              (A[(A.WARN_ADM_PLAYOUT_AUDIO_LOWLEVEL = 1032)] = 'WARN_ADM_PLAYOUT_AUDIO_LOWLEVEL'),
              (A[(A.WARN_ADM_RECORD_AUDIO_IS_ACTIVE = 1033)] = 'WARN_ADM_RECORD_AUDIO_IS_ACTIVE'),
              (A[(A.WARN_ADM_WINDOWS_NO_DATA_READY_EVENT = 1040)] =
                'WARN_ADM_WINDOWS_NO_DATA_READY_EVENT'),
              (A[(A.WARN_ADM_INCONSISTENT_AUDIO_DEVICE = 1042)] =
                'WARN_ADM_INCONSISTENT_AUDIO_DEVICE'),
              (A[(A.WARN_APM_HOWLING = 1051)] = 'WARN_APM_HOWLING'),
              (A[(A.WARN_ADM_GLITCH_STATE = 1052)] = 'WARN_ADM_GLITCH_STATE'),
              (A[(A.WARN_APM_RESIDUAL_ECHO = 1053)] = 'WARN_APM_RESIDUAL_ECHO'),
              (A[(A.WARN_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322)] =
                'WARN_ADM_WIN_CORE_NO_RECORDING_DEVICE'),
              (A[(A.WARN_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323)] =
                'WARN_ADM_WIN_CORE_NO_PLAYOUT_DEVICE'),
              (A[(A.WARN_ADM_WIN_CORE_IMPROPER_CAPTURE_RELEASE = 1324)] =
                'WARN_ADM_WIN_CORE_IMPROPER_CAPTURE_RELEASE'),
              (A[(A.WARN_SUPER_RESOLUTION_STREAM_OVER_LIMITATION = 1610)] =
                'WARN_SUPER_RESOLUTION_STREAM_OVER_LIMITATION'),
              (A[(A.WARN_SUPER_RESOLUTION_USER_COUNT_OVER_LIMITATION = 1611)] =
                'WARN_SUPER_RESOLUTION_USER_COUNT_OVER_LIMITATION'),
              (A[(A.WARN_SUPER_RESOLUTION_DEVICE_NOT_SUPPORTED = 1612)] =
                'WARN_SUPER_RESOLUTION_DEVICE_NOT_SUPPORTED'),
              (A[(A.WARN_RTM_LOGIN_TIMEOUT = 2005)] = 'WARN_RTM_LOGIN_TIMEOUT'),
              (A[(A.WARN_RTM_KEEP_ALIVE_TIMEOUT = 2009)] = 'WARN_RTM_KEEP_ALIVE_TIMEOUT'),
              ((R = E.ERROR_CODE_TYPE || (E.ERROR_CODE_TYPE = {}))[(R.ERR_OK = 0)] = 'ERR_OK'),
              (R[(R.ERR_FAILED = 1)] = 'ERR_FAILED'),
              (R[(R.ERR_INVALID_ARGUMENT = 2)] = 'ERR_INVALID_ARGUMENT'),
              (R[(R.ERR_NOT_READY = 3)] = 'ERR_NOT_READY'),
              (R[(R.ERR_NOT_SUPPORTED = 4)] = 'ERR_NOT_SUPPORTED'),
              (R[(R.ERR_REFUSED = 5)] = 'ERR_REFUSED'),
              (R[(R.ERR_BUFFER_TOO_SMALL = 6)] = 'ERR_BUFFER_TOO_SMALL'),
              (R[(R.ERR_NOT_INITIALIZED = 7)] = 'ERR_NOT_INITIALIZED'),
              (R[(R.ERR_NO_PERMISSION = 9)] = 'ERR_NO_PERMISSION'),
              (R[(R.ERR_TIMEDOUT = 10)] = 'ERR_TIMEDOUT'),
              (R[(R.ERR_CANCELED = 11)] = 'ERR_CANCELED'),
              (R[(R.ERR_TOO_OFTEN = 12)] = 'ERR_TOO_OFTEN'),
              (R[(R.ERR_BIND_SOCKET = 13)] = 'ERR_BIND_SOCKET'),
              (R[(R.ERR_NET_DOWN = 14)] = 'ERR_NET_DOWN'),
              (R[(R.ERR_NET_NOBUFS = 15)] = 'ERR_NET_NOBUFS'),
              (R[(R.ERR_JOIN_CHANNEL_REJECTED = 17)] = 'ERR_JOIN_CHANNEL_REJECTED'),
              (R[(R.ERR_LEAVE_CHANNEL_REJECTED = 18)] = 'ERR_LEAVE_CHANNEL_REJECTED'),
              (R[(R.ERR_ALREADY_IN_USE = 19)] = 'ERR_ALREADY_IN_USE'),
              (R[(R.ERR_ABORTED = 20)] = 'ERR_ABORTED'),
              (R[(R.ERR_INIT_NET_ENGINE = 21)] = 'ERR_INIT_NET_ENGINE'),
              (R[(R.ERR_RESOURCE_LIMITED = 22)] = 'ERR_RESOURCE_LIMITED'),
              (R[(R.ERR_INVALID_APP_ID = 101)] = 'ERR_INVALID_APP_ID'),
              (R[(R.ERR_INVALID_CHANNEL_NAME = 102)] = 'ERR_INVALID_CHANNEL_NAME'),
              (R[(R.ERR_NO_SERVER_RESOURCES = 103)] = 'ERR_NO_SERVER_RESOURCES'),
              (R[(R.ERR_TOKEN_EXPIRED = 109)] = 'ERR_TOKEN_EXPIRED'),
              (R[(R.ERR_INVALID_TOKEN = 110)] = 'ERR_INVALID_TOKEN'),
              (R[(R.ERR_CONNECTION_INTERRUPTED = 111)] = 'ERR_CONNECTION_INTERRUPTED'),
              (R[(R.ERR_CONNECTION_LOST = 112)] = 'ERR_CONNECTION_LOST'),
              (R[(R.ERR_NOT_IN_CHANNEL = 113)] = 'ERR_NOT_IN_CHANNEL'),
              (R[(R.ERR_SIZE_TOO_LARGE = 114)] = 'ERR_SIZE_TOO_LARGE'),
              (R[(R.ERR_BITRATE_LIMIT = 115)] = 'ERR_BITRATE_LIMIT'),
              (R[(R.ERR_TOO_MANY_DATA_STREAMS = 116)] = 'ERR_TOO_MANY_DATA_STREAMS'),
              (R[(R.ERR_STREAM_MESSAGE_TIMEOUT = 117)] = 'ERR_STREAM_MESSAGE_TIMEOUT'),
              (R[(R.ERR_SET_CLIENT_ROLE_NOT_AUTHORIZED = 119)] =
                'ERR_SET_CLIENT_ROLE_NOT_AUTHORIZED'),
              (R[(R.ERR_DECRYPTION_FAILED = 120)] = 'ERR_DECRYPTION_FAILED'),
              (R[(R.ERR_CLIENT_IS_BANNED_BY_SERVER = 123)] = 'ERR_CLIENT_IS_BANNED_BY_SERVER'),
              (R[(R.ERR_WATERMARK_PARAM = 124)] = 'ERR_WATERMARK_PARAM'),
              (R[(R.ERR_WATERMARK_PATH = 125)] = 'ERR_WATERMARK_PATH'),
              (R[(R.ERR_WATERMARK_PNG = 126)] = 'ERR_WATERMARK_PNG'),
              (R[(R.ERR_WATERMARKR_INFO = 127)] = 'ERR_WATERMARKR_INFO'),
              (R[(R.ERR_WATERMARK_ARGB = 128)] = 'ERR_WATERMARK_ARGB'),
              (R[(R.ERR_WATERMARK_READ = 129)] = 'ERR_WATERMARK_READ'),
              (R[(R.ERR_ENCRYPTED_STREAM_NOT_ALLOWED_PUBLISH = 130)] =
                'ERR_ENCRYPTED_STREAM_NOT_ALLOWED_PUBLISH'),
              (R[(R.ERR_INVALID_USER_ACCOUNT = 134)] = 'ERR_INVALID_USER_ACCOUNT'),
              (R[(R.ERR_PUBLISH_STREAM_CDN_ERROR = 151)] = 'ERR_PUBLISH_STREAM_CDN_ERROR'),
              (R[(R.ERR_PUBLISH_STREAM_NUM_REACH_LIMIT = 152)] =
                'ERR_PUBLISH_STREAM_NUM_REACH_LIMIT'),
              (R[(R.ERR_PUBLISH_STREAM_NOT_AUTHORIZED = 153)] =
                'ERR_PUBLISH_STREAM_NOT_AUTHORIZED'),
              (R[(R.ERR_PUBLISH_STREAM_INTERNAL_SERVER_ERROR = 154)] =
                'ERR_PUBLISH_STREAM_INTERNAL_SERVER_ERROR'),
              (R[(R.ERR_PUBLISH_STREAM_NOT_FOUND = 155)] = 'ERR_PUBLISH_STREAM_NOT_FOUND'),
              (R[(R.ERR_PUBLISH_STREAM_FORMAT_NOT_SUPPORTED = 156)] =
                'ERR_PUBLISH_STREAM_FORMAT_NOT_SUPPORTED'),
              (R[(R.ERR_LOGOUT_OTHER = 400)] = 'ERR_LOGOUT_OTHER'),
              (R[(R.ERR_LOGOUT_USER = 401)] = 'ERR_LOGOUT_USER'),
              (R[(R.ERR_LOGOUT_NET = 402)] = 'ERR_LOGOUT_NET'),
              (R[(R.ERR_LOGOUT_KICKED = 403)] = 'ERR_LOGOUT_KICKED'),
              (R[(R.ERR_LOGOUT_PACKET = 404)] = 'ERR_LOGOUT_PACKET'),
              (R[(R.ERR_LOGOUT_TOKEN_EXPIRED = 405)] = 'ERR_LOGOUT_TOKEN_EXPIRED'),
              (R[(R.ERR_LOGOUT_OLDVERSION = 406)] = 'ERR_LOGOUT_OLDVERSION'),
              (R[(R.ERR_LOGOUT_TOKEN_WRONG = 407)] = 'ERR_LOGOUT_TOKEN_WRONG'),
              (R[(R.ERR_LOGOUT_ALREADY_LOGOUT = 408)] = 'ERR_LOGOUT_ALREADY_LOGOUT'),
              (R[(R.ERR_LOGIN_OTHER = 420)] = 'ERR_LOGIN_OTHER'),
              (R[(R.ERR_LOGIN_NET = 421)] = 'ERR_LOGIN_NET'),
              (R[(R.ERR_LOGIN_FAILED = 422)] = 'ERR_LOGIN_FAILED'),
              (R[(R.ERR_LOGIN_CANCELED = 423)] = 'ERR_LOGIN_CANCELED'),
              (R[(R.ERR_LOGIN_TOKEN_EXPIRED = 424)] = 'ERR_LOGIN_TOKEN_EXPIRED'),
              (R[(R.ERR_LOGIN_OLD_VERSION = 425)] = 'ERR_LOGIN_OLD_VERSION'),
              (R[(R.ERR_LOGIN_TOKEN_WRONG = 426)] = 'ERR_LOGIN_TOKEN_WRONG'),
              (R[(R.ERR_LOGIN_TOKEN_KICKED = 427)] = 'ERR_LOGIN_TOKEN_KICKED'),
              (R[(R.ERR_LOGIN_ALREADY_LOGIN = 428)] = 'ERR_LOGIN_ALREADY_LOGIN'),
              (R[(R.ERR_JOIN_CHANNEL_OTHER = 440)] = 'ERR_JOIN_CHANNEL_OTHER'),
              (R[(R.ERR_SEND_MESSAGE_OTHER = 440)] = 'ERR_SEND_MESSAGE_OTHER'),
              (R[(R.ERR_SEND_MESSAGE_TIMEOUT = 441)] = 'ERR_SEND_MESSAGE_TIMEOUT'),
              (R[(R.ERR_QUERY_USERNUM_OTHER = 450)] = 'ERR_QUERY_USERNUM_OTHER'),
              (R[(R.ERR_QUERY_USERNUM_TIMEOUT = 451)] = 'ERR_QUERY_USERNUM_TIMEOUT'),
              (R[(R.ERR_QUERY_USERNUM_BYUSER = 452)] = 'ERR_QUERY_USERNUM_BYUSER'),
              (R[(R.ERR_LEAVE_CHANNEL_OTHER = 460)] = 'ERR_LEAVE_CHANNEL_OTHER'),
              (R[(R.ERR_LEAVE_CHANNEL_KICKED = 461)] = 'ERR_LEAVE_CHANNEL_KICKED'),
              (R[(R.ERR_LEAVE_CHANNEL_BYUSER = 462)] = 'ERR_LEAVE_CHANNEL_BYUSER'),
              (R[(R.ERR_LEAVE_CHANNEL_LOGOUT = 463)] = 'ERR_LEAVE_CHANNEL_LOGOUT'),
              (R[(R.ERR_LEAVE_CHANNEL_DISCONNECTED = 464)] = 'ERR_LEAVE_CHANNEL_DISCONNECTED'),
              (R[(R.ERR_INVITE_OTHER = 470)] = 'ERR_INVITE_OTHER'),
              (R[(R.ERR_INVITE_REINVITE = 471)] = 'ERR_INVITE_REINVITE'),
              (R[(R.ERR_INVITE_NET = 472)] = 'ERR_INVITE_NET'),
              (R[(R.ERR_INVITE_PEER_OFFLINE = 473)] = 'ERR_INVITE_PEER_OFFLINE'),
              (R[(R.ERR_INVITE_TIMEOUT = 474)] = 'ERR_INVITE_TIMEOUT'),
              (R[(R.ERR_INVITE_CANT_RECV = 475)] = 'ERR_INVITE_CANT_RECV'),
              (R[(R.ERR_LOAD_MEDIA_ENGINE = 1001)] = 'ERR_LOAD_MEDIA_ENGINE'),
              (R[(R.ERR_START_CALL = 1002)] = 'ERR_START_CALL'),
              (R[(R.ERR_START_CAMERA = 1003)] = 'ERR_START_CAMERA'),
              (R[(R.ERR_START_VIDEO_RENDER = 1004)] = 'ERR_START_VIDEO_RENDER'),
              (R[(R.ERR_ADM_GENERAL_ERROR = 1005)] = 'ERR_ADM_GENERAL_ERROR'),
              (R[(R.ERR_ADM_JAVA_RESOURCE = 1006)] = 'ERR_ADM_JAVA_RESOURCE'),
              (R[(R.ERR_ADM_SAMPLE_RATE = 1007)] = 'ERR_ADM_SAMPLE_RATE'),
              (R[(R.ERR_ADM_INIT_PLAYOUT = 1008)] = 'ERR_ADM_INIT_PLAYOUT'),
              (R[(R.ERR_ADM_START_PLAYOUT = 1009)] = 'ERR_ADM_START_PLAYOUT'),
              (R[(R.ERR_ADM_STOP_PLAYOUT = 1010)] = 'ERR_ADM_STOP_PLAYOUT'),
              (R[(R.ERR_ADM_INIT_RECORDING = 1011)] = 'ERR_ADM_INIT_RECORDING'),
              (R[(R.ERR_ADM_START_RECORDING = 1012)] = 'ERR_ADM_START_RECORDING'),
              (R[(R.ERR_ADM_STOP_RECORDING = 1013)] = 'ERR_ADM_STOP_RECORDING'),
              (R[(R.ERR_ADM_RUNTIME_PLAYOUT_ERROR = 1015)] = 'ERR_ADM_RUNTIME_PLAYOUT_ERROR'),
              (R[(R.ERR_ADM_RUNTIME_RECORDING_ERROR = 1017)] = 'ERR_ADM_RUNTIME_RECORDING_ERROR'),
              (R[(R.ERR_ADM_RECORD_AUDIO_FAILED = 1018)] = 'ERR_ADM_RECORD_AUDIO_FAILED'),
              (R[(R.ERR_ADM_INIT_LOOPBACK = 1022)] = 'ERR_ADM_INIT_LOOPBACK'),
              (R[(R.ERR_ADM_START_LOOPBACK = 1023)] = 'ERR_ADM_START_LOOPBACK'),
              (R[(R.ERR_ADM_NO_PERMISSION = 1027)] = 'ERR_ADM_NO_PERMISSION'),
              (R[(R.ERR_ADM_RECORD_AUDIO_IS_ACTIVE = 1033)] = 'ERR_ADM_RECORD_AUDIO_IS_ACTIVE'),
              (R[(R.ERR_ADM_ANDROID_JNI_JAVA_RESOURCE = 1101)] =
                'ERR_ADM_ANDROID_JNI_JAVA_RESOURCE'),
              (R[(R.ERR_ADM_ANDROID_JNI_NO_RECORD_FREQUENCY = 1108)] =
                'ERR_ADM_ANDROID_JNI_NO_RECORD_FREQUENCY'),
              (R[(R.ERR_ADM_ANDROID_JNI_NO_PLAYBACK_FREQUENCY = 1109)] =
                'ERR_ADM_ANDROID_JNI_NO_PLAYBACK_FREQUENCY'),
              (R[(R.ERR_ADM_ANDROID_JNI_JAVA_START_RECORD = 1111)] =
                'ERR_ADM_ANDROID_JNI_JAVA_START_RECORD'),
              (R[(R.ERR_ADM_ANDROID_JNI_JAVA_START_PLAYBACK = 1112)] =
                'ERR_ADM_ANDROID_JNI_JAVA_START_PLAYBACK'),
              (R[(R.ERR_ADM_ANDROID_JNI_JAVA_RECORD_ERROR = 1115)] =
                'ERR_ADM_ANDROID_JNI_JAVA_RECORD_ERROR'),
              (R[(R.ERR_ADM_ANDROID_OPENSL_CREATE_ENGINE = 1151)] =
                'ERR_ADM_ANDROID_OPENSL_CREATE_ENGINE'),
              (R[(R.ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_RECORDER = 1153)] =
                'ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_RECORDER'),
              (R[(R.ERR_ADM_ANDROID_OPENSL_START_RECORDER_THREAD = 1156)] =
                'ERR_ADM_ANDROID_OPENSL_START_RECORDER_THREAD'),
              (R[(R.ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_PLAYER = 1157)] =
                'ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_PLAYER'),
              (R[(R.ERR_ADM_ANDROID_OPENSL_START_PLAYER_THREAD = 1160)] =
                'ERR_ADM_ANDROID_OPENSL_START_PLAYER_THREAD'),
              (R[(R.ERR_ADM_IOS_INPUT_NOT_AVAILABLE = 1201)] = 'ERR_ADM_IOS_INPUT_NOT_AVAILABLE'),
              (R[(R.ERR_ADM_IOS_ACTIVATE_SESSION_FAIL = 1206)] =
                'ERR_ADM_IOS_ACTIVATE_SESSION_FAIL'),
              (R[(R.ERR_ADM_IOS_VPIO_INIT_FAIL = 1210)] = 'ERR_ADM_IOS_VPIO_INIT_FAIL'),
              (R[(R.ERR_ADM_IOS_VPIO_REINIT_FAIL = 1213)] = 'ERR_ADM_IOS_VPIO_REINIT_FAIL'),
              (R[(R.ERR_ADM_IOS_VPIO_RESTART_FAIL = 1214)] = 'ERR_ADM_IOS_VPIO_RESTART_FAIL'),
              (R[(R.ERR_ADM_IOS_SET_RENDER_CALLBACK_FAIL = 1219)] =
                'ERR_ADM_IOS_SET_RENDER_CALLBACK_FAIL'),
              (R[(R.ERR_ADM_IOS_SESSION_SAMPLERATR_ZERO = 1221)] =
                'ERR_ADM_IOS_SESSION_SAMPLERATR_ZERO'),
              (R[(R.ERR_ADM_WIN_CORE_INIT = 1301)] = 'ERR_ADM_WIN_CORE_INIT'),
              (R[(R.ERR_ADM_WIN_CORE_INIT_RECORDING = 1303)] = 'ERR_ADM_WIN_CORE_INIT_RECORDING'),
              (R[(R.ERR_ADM_WIN_CORE_INIT_PLAYOUT = 1306)] = 'ERR_ADM_WIN_CORE_INIT_PLAYOUT'),
              (R[(R.ERR_ADM_WIN_CORE_INIT_PLAYOUT_NULL = 1307)] =
                'ERR_ADM_WIN_CORE_INIT_PLAYOUT_NULL'),
              (R[(R.ERR_ADM_WIN_CORE_START_RECORDING = 1309)] = 'ERR_ADM_WIN_CORE_START_RECORDING'),
              (R[(R.ERR_ADM_WIN_CORE_CREATE_REC_THREAD = 1311)] =
                'ERR_ADM_WIN_CORE_CREATE_REC_THREAD'),
              (R[(R.ERR_ADM_WIN_CORE_CAPTURE_NOT_STARTUP = 1314)] =
                'ERR_ADM_WIN_CORE_CAPTURE_NOT_STARTUP'),
              (R[(R.ERR_ADM_WIN_CORE_CREATE_RENDER_THREAD = 1319)] =
                'ERR_ADM_WIN_CORE_CREATE_RENDER_THREAD'),
              (R[(R.ERR_ADM_WIN_CORE_RENDER_NOT_STARTUP = 1320)] =
                'ERR_ADM_WIN_CORE_RENDER_NOT_STARTUP'),
              (R[(R.ERR_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322)] =
                'ERR_ADM_WIN_CORE_NO_RECORDING_DEVICE'),
              (R[(R.ERR_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323)] =
                'ERR_ADM_WIN_CORE_NO_PLAYOUT_DEVICE'),
              (R[(R.ERR_ADM_WIN_WAVE_INIT = 1351)] = 'ERR_ADM_WIN_WAVE_INIT'),
              (R[(R.ERR_ADM_WIN_WAVE_INIT_RECORDING = 1353)] = 'ERR_ADM_WIN_WAVE_INIT_RECORDING'),
              (R[(R.ERR_ADM_WIN_WAVE_INIT_MICROPHONE = 1354)] = 'ERR_ADM_WIN_WAVE_INIT_MICROPHONE'),
              (R[(R.ERR_ADM_WIN_WAVE_INIT_PLAYOUT = 1355)] = 'ERR_ADM_WIN_WAVE_INIT_PLAYOUT'),
              (R[(R.ERR_ADM_WIN_WAVE_INIT_SPEAKER = 1356)] = 'ERR_ADM_WIN_WAVE_INIT_SPEAKER'),
              (R[(R.ERR_ADM_WIN_WAVE_START_RECORDING = 1357)] = 'ERR_ADM_WIN_WAVE_START_RECORDING'),
              (R[(R.ERR_ADM_WIN_WAVE_START_PLAYOUT = 1358)] = 'ERR_ADM_WIN_WAVE_START_PLAYOUT'),
              (R[(R.ERR_ADM_NO_RECORDING_DEVICE = 1359)] = 'ERR_ADM_NO_RECORDING_DEVICE'),
              (R[(R.ERR_ADM_NO_PLAYOUT_DEVICE = 1360)] = 'ERR_ADM_NO_PLAYOUT_DEVICE'),
              (R[(R.ERR_VDM_CAMERA_NOT_AUTHORIZED = 1501)] = 'ERR_VDM_CAMERA_NOT_AUTHORIZED'),
              (R[(R.ERR_VDM_WIN_DEVICE_IN_USE = 1502)] = 'ERR_VDM_WIN_DEVICE_IN_USE'),
              (R[(R.ERR_VCM_UNKNOWN_ERROR = 1600)] = 'ERR_VCM_UNKNOWN_ERROR'),
              (R[(R.ERR_VCM_ENCODER_INIT_ERROR = 1601)] = 'ERR_VCM_ENCODER_INIT_ERROR'),
              (R[(R.ERR_VCM_ENCODER_ENCODE_ERROR = 1602)] = 'ERR_VCM_ENCODER_ENCODE_ERROR'),
              (R[(R.ERR_VCM_ENCODER_SET_ERROR = 1603)] = 'ERR_VCM_ENCODER_SET_ERROR'),
              ((_ = E.LOG_FILTER_TYPE || (E.LOG_FILTER_TYPE = {}))[(_.LOG_FILTER_OFF = 0)] =
                'LOG_FILTER_OFF'),
              (_[(_.LOG_FILTER_DEBUG = 2063)] = 'LOG_FILTER_DEBUG'),
              (_[(_.LOG_FILTER_INFO = 15)] = 'LOG_FILTER_INFO'),
              (_[(_.LOG_FILTER_WARN = 14)] = 'LOG_FILTER_WARN'),
              (_[(_.LOG_FILTER_ERROR = 12)] = 'LOG_FILTER_ERROR'),
              (_[(_.LOG_FILTER_CRITICAL = 8)] = 'LOG_FILTER_CRITICAL'),
              (_[(_.LOG_FILTER_MASK = 2063)] = 'LOG_FILTER_MASK');
          })(N || (N = {})),
          (function (E) {
            var _, R, A, T, O, I, N, D;
            ((D = E.MEDIA_SOURCE_TYPE || (E.MEDIA_SOURCE_TYPE = {}))[(D.AUDIO_PLAYOUT_SOURCE = 0)] =
              'AUDIO_PLAYOUT_SOURCE'),
              (D[(D.AUDIO_RECORDING_SOURCE = 1)] = 'AUDIO_RECORDING_SOURCE'),
              ((N = E.AUDIO_FRAME_TYPE || (E.AUDIO_FRAME_TYPE = {}))[(N.FRAME_TYPE_PCM16 = 0)] =
                'FRAME_TYPE_PCM16'),
              ((I = E.VIDEO_FRAME_TYPE || (E.VIDEO_FRAME_TYPE = {}))[(I.FRAME_TYPE_YUV420 = 0)] =
                'FRAME_TYPE_YUV420'),
              (I[(I.FRAME_TYPE_YUV422 = 1)] = 'FRAME_TYPE_YUV422'),
              (I[(I.FRAME_TYPE_RGBA = 2)] = 'FRAME_TYPE_RGBA'),
              ((O = E.VIDEO_OBSERVER_POSITION || (E.VIDEO_OBSERVER_POSITION = {}))[
                (O.POSITION_POST_CAPTURER = 1)
              ] = 'POSITION_POST_CAPTURER'),
              (O[(O.POSITION_PRE_RENDERER = 2)] = 'POSITION_PRE_RENDERER'),
              (O[(O.POSITION_PRE_ENCODER = 4)] = 'POSITION_PRE_ENCODER'),
              ((T = E.PLANE_TYPE || (E.PLANE_TYPE = {}))[(T.Y_PLANE = 0)] = 'Y_PLANE'),
              (T[(T.U_PLANE = 1)] = 'U_PLANE'),
              (T[(T.V_PLANE = 2)] = 'V_PLANE'),
              (T[(T.NUM_OF_PLANES = 3)] = 'NUM_OF_PLANES'),
              ((A = E.VIDEO_TYPE || (E.VIDEO_TYPE = {}))[(A.VIDEO_TYPE_UNKNOWN = 0)] =
                'VIDEO_TYPE_UNKNOWN'),
              (A[(A.VIDEO_TYPE_I420 = 1)] = 'VIDEO_TYPE_I420'),
              (A[(A.VIDEO_TYPE_IYUV = 2)] = 'VIDEO_TYPE_IYUV'),
              (A[(A.VIDEO_TYPE_RGB24 = 3)] = 'VIDEO_TYPE_RGB24'),
              (A[(A.VIDEO_TYPE_ABGR = 4)] = 'VIDEO_TYPE_ABGR'),
              (A[(A.VIDEO_TYPE_ARGB = 5)] = 'VIDEO_TYPE_ARGB'),
              (A[(A.VIDEO_TYPE_ARGB4444 = 6)] = 'VIDEO_TYPE_ARGB4444'),
              (A[(A.VIDEO_TYPE_RGB565 = 7)] = 'VIDEO_TYPE_RGB565'),
              (A[(A.VIDEO_TYPE_ARGB1555 = 8)] = 'VIDEO_TYPE_ARGB1555'),
              (A[(A.VIDEO_TYPE_YUY2 = 9)] = 'VIDEO_TYPE_YUY2'),
              (A[(A.VIDEO_TYPE_YV12 = 10)] = 'VIDEO_TYPE_YV12'),
              (A[(A.VIDEO_TYPE_UYVY = 11)] = 'VIDEO_TYPE_UYVY'),
              (A[(A.VIDEO_TYPE_MJPG = 12)] = 'VIDEO_TYPE_MJPG'),
              (A[(A.VIDEO_TYPE_NV21 = 13)] = 'VIDEO_TYPE_NV21'),
              (A[(A.VIDEO_TYPE_NV12 = 14)] = 'VIDEO_TYPE_NV12'),
              (A[(A.VIDEO_TYPE_BGRA = 15)] = 'VIDEO_TYPE_BGRA'),
              (A[(A.VIDEO_TYPE_RGBA = 16)] = 'VIDEO_TYPE_RGBA'),
              (A[(A.VIDEO_TYPE_I422 = 17)] = 'VIDEO_TYPE_I422'),
              ((R = E.VIDEO_BUFFER_TYPE || (E.VIDEO_BUFFER_TYPE = {}))[
                (R.VIDEO_BUFFER_RAW_DATA = 1)
              ] = 'VIDEO_BUFFER_RAW_DATA'),
              ((_ = E.VIDEO_PIXEL_FORMAT || (E.VIDEO_PIXEL_FORMAT = {}))[
                (_.VIDEO_PIXEL_UNKNOWN = 0)
              ] = 'VIDEO_PIXEL_UNKNOWN'),
              (_[(_.VIDEO_PIXEL_I420 = 1)] = 'VIDEO_PIXEL_I420'),
              (_[(_.VIDEO_PIXEL_BGRA = 2)] = 'VIDEO_PIXEL_BGRA'),
              (_[(_.VIDEO_PIXEL_NV21 = 3)] = 'VIDEO_PIXEL_NV21'),
              (_[(_.VIDEO_PIXEL_RGBA = 4)] = 'VIDEO_PIXEL_RGBA'),
              (_[(_.VIDEO_PIXEL_IMC2 = 5)] = 'VIDEO_PIXEL_IMC2'),
              (_[(_.VIDEO_PIXEL_ARGB = 7)] = 'VIDEO_PIXEL_ARGB'),
              (_[(_.VIDEO_PIXEL_NV12 = 8)] = 'VIDEO_PIXEL_NV12'),
              (_[(_.VIDEO_PIXEL_I422 = 16)] = 'VIDEO_PIXEL_I422');
          })(N || (N = {})),
          (function (E) {
            var _,
              R,
              A,
              T,
              O,
              I,
              N,
              D,
              S,
              L,
              e,
              C,
              t,
              P,
              U,
              n,
              M,
              r,
              i,
              o,
              V,
              a,
              u,
              F,
              G,
              c,
              s,
              B,
              d,
              f,
              Y,
              H,
              l,
              h,
              m,
              W,
              v,
              p,
              g,
              X,
              K,
              b,
              y,
              w,
              x,
              J,
              Q,
              Z,
              k,
              j,
              q,
              z,
              $,
              EE,
              _E,
              RE,
              AE,
              TE,
              OE,
              IE,
              NE,
              DE,
              SE;
            ((SE = E.MAX_DEVICE_ID_LENGTH_TYPE || (E.MAX_DEVICE_ID_LENGTH_TYPE = {}))[
              (SE.MAX_DEVICE_ID_LENGTH = 512)
            ] = 'MAX_DEVICE_ID_LENGTH'),
              ((DE = E.MAX_USER_ACCOUNT_LENGTH_TYPE || (E.MAX_USER_ACCOUNT_LENGTH_TYPE = {}))[
                (DE.MAX_USER_ACCOUNT_LENGTH = 256)
              ] = 'MAX_USER_ACCOUNT_LENGTH'),
              ((NE = E.MAX_CHANNEL_ID_LENGTH_TYPE || (E.MAX_CHANNEL_ID_LENGTH_TYPE = {}))[
                (NE.MAX_CHANNEL_ID_LENGTH = 65)
              ] = 'MAX_CHANNEL_ID_LENGTH'),
              ((IE = E.QUALITY_REPORT_FORMAT_TYPE || (E.QUALITY_REPORT_FORMAT_TYPE = {}))[
                (IE.QUALITY_REPORT_JSON = 0)
              ] = 'QUALITY_REPORT_JSON'),
              (IE[(IE.QUALITY_REPORT_HTML = 1)] = 'QUALITY_REPORT_HTML'),
              ((OE = E.MEDIA_ENGINE_EVENT_CODE_TYPE || (E.MEDIA_ENGINE_EVENT_CODE_TYPE = {}))[
                (OE.MEDIA_ENGINE_RECORDING_ERROR = 0)
              ] = 'MEDIA_ENGINE_RECORDING_ERROR'),
              (OE[(OE.MEDIA_ENGINE_PLAYOUT_ERROR = 1)] = 'MEDIA_ENGINE_PLAYOUT_ERROR'),
              (OE[(OE.MEDIA_ENGINE_RECORDING_WARNING = 2)] = 'MEDIA_ENGINE_RECORDING_WARNING'),
              (OE[(OE.MEDIA_ENGINE_PLAYOUT_WARNING = 3)] = 'MEDIA_ENGINE_PLAYOUT_WARNING'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_FILE_MIX_FINISH = 10)] =
                'MEDIA_ENGINE_AUDIO_FILE_MIX_FINISH'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_FAREND_MUSIC_BEGINS = 12)] =
                'MEDIA_ENGINE_AUDIO_FAREND_MUSIC_BEGINS'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_FAREND_MUSIC_ENDS = 13)] =
                'MEDIA_ENGINE_AUDIO_FAREND_MUSIC_ENDS'),
              (OE[(OE.MEDIA_ENGINE_LOCAL_AUDIO_RECORD_ENABLED = 14)] =
                'MEDIA_ENGINE_LOCAL_AUDIO_RECORD_ENABLED'),
              (OE[(OE.MEDIA_ENGINE_LOCAL_AUDIO_RECORD_DISABLED = 15)] =
                'MEDIA_ENGINE_LOCAL_AUDIO_RECORD_DISABLED'),
              (OE[(OE.MEDIA_ENGINE_ROLE_BROADCASTER_SOLO = 20)] =
                'MEDIA_ENGINE_ROLE_BROADCASTER_SOLO'),
              (OE[(OE.MEDIA_ENGINE_ROLE_BROADCASTER_INTERACTIVE = 21)] =
                'MEDIA_ENGINE_ROLE_BROADCASTER_INTERACTIVE'),
              (OE[(OE.MEDIA_ENGINE_ROLE_AUDIENCE = 22)] = 'MEDIA_ENGINE_ROLE_AUDIENCE'),
              (OE[(OE.MEDIA_ENGINE_ROLE_COMM_PEER = 23)] = 'MEDIA_ENGINE_ROLE_COMM_PEER'),
              (OE[(OE.MEDIA_ENGINE_ROLE_GAME_PEER = 24)] = 'MEDIA_ENGINE_ROLE_GAME_PEER'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ADM_REQUIRE_RESTART = 110)] =
                'MEDIA_ENGINE_AUDIO_ADM_REQUIRE_RESTART'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ADM_SPECIAL_RESTART = 111)] =
                'MEDIA_ENGINE_AUDIO_ADM_SPECIAL_RESTART'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ADM_USING_COMM_PARAMS = 112)] =
                'MEDIA_ENGINE_AUDIO_ADM_USING_COMM_PARAMS'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ADM_USING_NORM_PARAMS = 113)] =
                'MEDIA_ENGINE_AUDIO_ADM_USING_NORM_PARAMS'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_EVENT_MIXING_PLAY = 710)] =
                'MEDIA_ENGINE_AUDIO_EVENT_MIXING_PLAY'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_EVENT_MIXING_PAUSED = 711)] =
                'MEDIA_ENGINE_AUDIO_EVENT_MIXING_PAUSED'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_EVENT_MIXING_RESTART = 712)] =
                'MEDIA_ENGINE_AUDIO_EVENT_MIXING_RESTART'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_EVENT_MIXING_STOPPED = 713)] =
                'MEDIA_ENGINE_AUDIO_EVENT_MIXING_STOPPED'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_EVENT_MIXING_ERROR = 714)] =
                'MEDIA_ENGINE_AUDIO_EVENT_MIXING_ERROR'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ERROR_MIXING_OPEN = 701)] =
                'MEDIA_ENGINE_AUDIO_ERROR_MIXING_OPEN'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ERROR_MIXING_TOO_FREQUENT = 702)] =
                'MEDIA_ENGINE_AUDIO_ERROR_MIXING_TOO_FREQUENT'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ERROR_MIXING_INTERRUPTED_EOF = 703)] =
                'MEDIA_ENGINE_AUDIO_ERROR_MIXING_INTERRUPTED_EOF'),
              (OE[(OE.MEDIA_ENGINE_AUDIO_ERROR_MIXING_NO_ERROR = 0)] =
                'MEDIA_ENGINE_AUDIO_ERROR_MIXING_NO_ERROR'),
              ((TE = E.AUDIO_MIXING_STATE_TYPE || (E.AUDIO_MIXING_STATE_TYPE = {}))[
                (TE.AUDIO_MIXING_STATE_PLAYING = 710)
              ] = 'AUDIO_MIXING_STATE_PLAYING'),
              (TE[(TE.AUDIO_MIXING_STATE_PAUSED = 711)] = 'AUDIO_MIXING_STATE_PAUSED'),
              (TE[(TE.AUDIO_MIXING_STATE_STOPPED = 713)] = 'AUDIO_MIXING_STATE_STOPPED'),
              (TE[(TE.AUDIO_MIXING_STATE_FAILED = 714)] = 'AUDIO_MIXING_STATE_FAILED'),
              ((AE = E.AUDIO_MIXING_ERROR_TYPE || (E.AUDIO_MIXING_ERROR_TYPE = {}))[
                (AE.AUDIO_MIXING_ERROR_CAN_NOT_OPEN = 701)
              ] = 'AUDIO_MIXING_ERROR_CAN_NOT_OPEN'),
              (AE[(AE.AUDIO_MIXING_ERROR_TOO_FREQUENT_CALL = 702)] =
                'AUDIO_MIXING_ERROR_TOO_FREQUENT_CALL'),
              (AE[(AE.AUDIO_MIXING_ERROR_INTERRUPTED_EOF = 703)] =
                'AUDIO_MIXING_ERROR_INTERRUPTED_EOF'),
              (AE[(AE.AUDIO_MIXING_ERROR_OK = 0)] = 'AUDIO_MIXING_ERROR_OK'),
              ((RE = E.MEDIA_DEVICE_STATE_TYPE || (E.MEDIA_DEVICE_STATE_TYPE = {}))[
                (RE.MEDIA_DEVICE_STATE_ACTIVE = 1)
              ] = 'MEDIA_DEVICE_STATE_ACTIVE'),
              (RE[(RE.MEDIA_DEVICE_STATE_DISABLED = 2)] = 'MEDIA_DEVICE_STATE_DISABLED'),
              (RE[(RE.MEDIA_DEVICE_STATE_NOT_PRESENT = 4)] = 'MEDIA_DEVICE_STATE_NOT_PRESENT'),
              (RE[(RE.MEDIA_DEVICE_STATE_UNPLUGGED = 8)] = 'MEDIA_DEVICE_STATE_UNPLUGGED'),
              ((_E = E.MEDIA_DEVICE_TYPE || (E.MEDIA_DEVICE_TYPE = {}))[
                (_E.UNKNOWN_AUDIO_DEVICE = -1)
              ] = 'UNKNOWN_AUDIO_DEVICE'),
              (_E[(_E.AUDIO_PLAYOUT_DEVICE = 0)] = 'AUDIO_PLAYOUT_DEVICE'),
              (_E[(_E.AUDIO_RECORDING_DEVICE = 1)] = 'AUDIO_RECORDING_DEVICE'),
              (_E[(_E.VIDEO_RENDER_DEVICE = 2)] = 'VIDEO_RENDER_DEVICE'),
              (_E[(_E.VIDEO_CAPTURE_DEVICE = 3)] = 'VIDEO_CAPTURE_DEVICE'),
              (_E[(_E.AUDIO_APPLICATION_PLAYOUT_DEVICE = 4)] = 'AUDIO_APPLICATION_PLAYOUT_DEVICE'),
              ((EE = E.LOCAL_VIDEO_STREAM_STATE || (E.LOCAL_VIDEO_STREAM_STATE = {}))[
                (EE.LOCAL_VIDEO_STREAM_STATE_STOPPED = 0)
              ] = 'LOCAL_VIDEO_STREAM_STATE_STOPPED'),
              (EE[(EE.LOCAL_VIDEO_STREAM_STATE_CAPTURING = 1)] =
                'LOCAL_VIDEO_STREAM_STATE_CAPTURING'),
              (EE[(EE.LOCAL_VIDEO_STREAM_STATE_ENCODING = 2)] =
                'LOCAL_VIDEO_STREAM_STATE_ENCODING'),
              (EE[(EE.LOCAL_VIDEO_STREAM_STATE_FAILED = 3)] = 'LOCAL_VIDEO_STREAM_STATE_FAILED'),
              (($ = E.LOCAL_VIDEO_STREAM_ERROR || (E.LOCAL_VIDEO_STREAM_ERROR = {}))[
                ($.LOCAL_VIDEO_STREAM_ERROR_OK = 0)
              ] = 'LOCAL_VIDEO_STREAM_ERROR_OK'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_FAILURE = 1)] = 'LOCAL_VIDEO_STREAM_ERROR_FAILURE'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2)] =
                'LOCAL_VIDEO_STREAM_ERROR_DEVICE_NO_PERMISSION'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_DEVICE_BUSY = 3)] =
                'LOCAL_VIDEO_STREAM_ERROR_DEVICE_BUSY'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE = 4)] =
                'LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_ENCODE_FAILURE = 5)] =
                'LOCAL_VIDEO_STREAM_ERROR_ENCODE_FAILURE'),
              ($[($.LOCAL_VIDEO_STREAM_ERROR_SCREEN_CAPTURE_WINDOW_MINIMIZED = 11)] =
                'LOCAL_VIDEO_STREAM_ERROR_SCREEN_CAPTURE_WINDOW_MINIMIZED'),
              ((z = E.LOCAL_AUDIO_STREAM_STATE || (E.LOCAL_AUDIO_STREAM_STATE = {}))[
                (z.LOCAL_AUDIO_STREAM_STATE_STOPPED = 0)
              ] = 'LOCAL_AUDIO_STREAM_STATE_STOPPED'),
              (z[(z.LOCAL_AUDIO_STREAM_STATE_RECORDING = 1)] =
                'LOCAL_AUDIO_STREAM_STATE_RECORDING'),
              (z[(z.LOCAL_AUDIO_STREAM_STATE_ENCODING = 2)] = 'LOCAL_AUDIO_STREAM_STATE_ENCODING'),
              (z[(z.LOCAL_AUDIO_STREAM_STATE_FAILED = 3)] = 'LOCAL_AUDIO_STREAM_STATE_FAILED'),
              ((q = E.LOCAL_AUDIO_STREAM_ERROR || (E.LOCAL_AUDIO_STREAM_ERROR = {}))[
                (q.LOCAL_AUDIO_STREAM_ERROR_OK = 0)
              ] = 'LOCAL_AUDIO_STREAM_ERROR_OK'),
              (q[(q.LOCAL_AUDIO_STREAM_ERROR_FAILURE = 1)] = 'LOCAL_AUDIO_STREAM_ERROR_FAILURE'),
              (q[(q.LOCAL_AUDIO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2)] =
                'LOCAL_AUDIO_STREAM_ERROR_DEVICE_NO_PERMISSION'),
              (q[(q.LOCAL_AUDIO_STREAM_ERROR_DEVICE_BUSY = 3)] =
                'LOCAL_AUDIO_STREAM_ERROR_DEVICE_BUSY'),
              (q[(q.LOCAL_AUDIO_STREAM_ERROR_RECORD_FAILURE = 4)] =
                'LOCAL_AUDIO_STREAM_ERROR_RECORD_FAILURE'),
              (q[(q.LOCAL_AUDIO_STREAM_ERROR_ENCODE_FAILURE = 5)] =
                'LOCAL_AUDIO_STREAM_ERROR_ENCODE_FAILURE'),
              ((j = E.AUDIO_RECORDING_QUALITY_TYPE || (E.AUDIO_RECORDING_QUALITY_TYPE = {}))[
                (j.AUDIO_RECORDING_QUALITY_LOW = 0)
              ] = 'AUDIO_RECORDING_QUALITY_LOW'),
              (j[(j.AUDIO_RECORDING_QUALITY_MEDIUM = 1)] = 'AUDIO_RECORDING_QUALITY_MEDIUM'),
              (j[(j.AUDIO_RECORDING_QUALITY_HIGH = 2)] = 'AUDIO_RECORDING_QUALITY_HIGH'),
              ((k = E.QUALITY_TYPE || (E.QUALITY_TYPE = {}))[(k.QUALITY_UNKNOWN = 0)] =
                'QUALITY_UNKNOWN'),
              (k[(k.QUALITY_EXCELLENT = 1)] = 'QUALITY_EXCELLENT'),
              (k[(k.QUALITY_GOOD = 2)] = 'QUALITY_GOOD'),
              (k[(k.QUALITY_POOR = 3)] = 'QUALITY_POOR'),
              (k[(k.QUALITY_BAD = 4)] = 'QUALITY_BAD'),
              (k[(k.QUALITY_VBAD = 5)] = 'QUALITY_VBAD'),
              (k[(k.QUALITY_DOWN = 6)] = 'QUALITY_DOWN'),
              (k[(k.QUALITY_UNSUPPORTED = 7)] = 'QUALITY_UNSUPPORTED'),
              (k[(k.QUALITY_DETECTING = 8)] = 'QUALITY_DETECTING'),
              (function (E) {
                (E[(E.RENDER_MODE_HIDDEN = 1)] = 'RENDER_MODE_HIDDEN'),
                  (E[(E.RENDER_MODE_FIT = 2)] = 'RENDER_MODE_FIT'),
                  (E[(E.RENDER_MODE_ADAPTIVE = 3)] = 'RENDER_MODE_ADAPTIVE'),
                  (E[(E.RENDER_MODE_FILL = 4)] = 'RENDER_MODE_FILL');
              })((_ = E.RENDER_MODE_TYPE || (E.RENDER_MODE_TYPE = {}))),
              (function (E) {
                (E[(E.VIDEO_MIRROR_MODE_AUTO = 0)] = 'VIDEO_MIRROR_MODE_AUTO'),
                  (E[(E.VIDEO_MIRROR_MODE_ENABLED = 1)] = 'VIDEO_MIRROR_MODE_ENABLED'),
                  (E[(E.VIDEO_MIRROR_MODE_DISABLED = 2)] = 'VIDEO_MIRROR_MODE_DISABLED');
              })((R = E.VIDEO_MIRROR_MODE_TYPE || (E.VIDEO_MIRROR_MODE_TYPE = {}))),
              ((Z = E.VIDEO_PROFILE_TYPE || (E.VIDEO_PROFILE_TYPE = {}))[
                (Z.VIDEO_PROFILE_LANDSCAPE_120P = 0)
              ] = 'VIDEO_PROFILE_LANDSCAPE_120P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_120P_3 = 2)] = 'VIDEO_PROFILE_LANDSCAPE_120P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_180P = 10)] = 'VIDEO_PROFILE_LANDSCAPE_180P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_180P_3 = 12)] = 'VIDEO_PROFILE_LANDSCAPE_180P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_180P_4 = 13)] = 'VIDEO_PROFILE_LANDSCAPE_180P_4'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_240P = 20)] = 'VIDEO_PROFILE_LANDSCAPE_240P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_240P_3 = 22)] = 'VIDEO_PROFILE_LANDSCAPE_240P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_240P_4 = 23)] = 'VIDEO_PROFILE_LANDSCAPE_240P_4'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P = 30)] = 'VIDEO_PROFILE_LANDSCAPE_360P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_3 = 32)] = 'VIDEO_PROFILE_LANDSCAPE_360P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_4 = 33)] = 'VIDEO_PROFILE_LANDSCAPE_360P_4'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_6 = 35)] = 'VIDEO_PROFILE_LANDSCAPE_360P_6'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_7 = 36)] = 'VIDEO_PROFILE_LANDSCAPE_360P_7'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_8 = 37)] = 'VIDEO_PROFILE_LANDSCAPE_360P_8'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_9 = 38)] = 'VIDEO_PROFILE_LANDSCAPE_360P_9'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_10 = 39)] = 'VIDEO_PROFILE_LANDSCAPE_360P_10'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_360P_11 = 100)] = 'VIDEO_PROFILE_LANDSCAPE_360P_11'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P = 40)] = 'VIDEO_PROFILE_LANDSCAPE_480P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_3 = 42)] = 'VIDEO_PROFILE_LANDSCAPE_480P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_4 = 43)] = 'VIDEO_PROFILE_LANDSCAPE_480P_4'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_6 = 45)] = 'VIDEO_PROFILE_LANDSCAPE_480P_6'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_8 = 47)] = 'VIDEO_PROFILE_LANDSCAPE_480P_8'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_9 = 48)] = 'VIDEO_PROFILE_LANDSCAPE_480P_9'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_480P_10 = 49)] = 'VIDEO_PROFILE_LANDSCAPE_480P_10'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_720P = 50)] = 'VIDEO_PROFILE_LANDSCAPE_720P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_720P_3 = 52)] = 'VIDEO_PROFILE_LANDSCAPE_720P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_720P_5 = 54)] = 'VIDEO_PROFILE_LANDSCAPE_720P_5'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_720P_6 = 55)] = 'VIDEO_PROFILE_LANDSCAPE_720P_6'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_1080P = 60)] = 'VIDEO_PROFILE_LANDSCAPE_1080P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_1080P_3 = 62)] = 'VIDEO_PROFILE_LANDSCAPE_1080P_3'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_1080P_5 = 64)] = 'VIDEO_PROFILE_LANDSCAPE_1080P_5'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_1440P = 66)] = 'VIDEO_PROFILE_LANDSCAPE_1440P'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_1440P_2 = 67)] = 'VIDEO_PROFILE_LANDSCAPE_1440P_2'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_4K = 70)] = 'VIDEO_PROFILE_LANDSCAPE_4K'),
              (Z[(Z.VIDEO_PROFILE_LANDSCAPE_4K_3 = 72)] = 'VIDEO_PROFILE_LANDSCAPE_4K_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_120P = 1e3)] = 'VIDEO_PROFILE_PORTRAIT_120P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_120P_3 = 1002)] = 'VIDEO_PROFILE_PORTRAIT_120P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_180P = 1010)] = 'VIDEO_PROFILE_PORTRAIT_180P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_180P_3 = 1012)] = 'VIDEO_PROFILE_PORTRAIT_180P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_180P_4 = 1013)] = 'VIDEO_PROFILE_PORTRAIT_180P_4'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_240P = 1020)] = 'VIDEO_PROFILE_PORTRAIT_240P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_240P_3 = 1022)] = 'VIDEO_PROFILE_PORTRAIT_240P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_240P_4 = 1023)] = 'VIDEO_PROFILE_PORTRAIT_240P_4'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P = 1030)] = 'VIDEO_PROFILE_PORTRAIT_360P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_3 = 1032)] = 'VIDEO_PROFILE_PORTRAIT_360P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_4 = 1033)] = 'VIDEO_PROFILE_PORTRAIT_360P_4'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_6 = 1035)] = 'VIDEO_PROFILE_PORTRAIT_360P_6'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_7 = 1036)] = 'VIDEO_PROFILE_PORTRAIT_360P_7'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_8 = 1037)] = 'VIDEO_PROFILE_PORTRAIT_360P_8'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_9 = 1038)] = 'VIDEO_PROFILE_PORTRAIT_360P_9'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_10 = 1039)] = 'VIDEO_PROFILE_PORTRAIT_360P_10'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_360P_11 = 1100)] = 'VIDEO_PROFILE_PORTRAIT_360P_11'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P = 1040)] = 'VIDEO_PROFILE_PORTRAIT_480P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_3 = 1042)] = 'VIDEO_PROFILE_PORTRAIT_480P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_4 = 1043)] = 'VIDEO_PROFILE_PORTRAIT_480P_4'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_6 = 1045)] = 'VIDEO_PROFILE_PORTRAIT_480P_6'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_8 = 1047)] = 'VIDEO_PROFILE_PORTRAIT_480P_8'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_9 = 1048)] = 'VIDEO_PROFILE_PORTRAIT_480P_9'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_480P_10 = 1049)] = 'VIDEO_PROFILE_PORTRAIT_480P_10'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_720P = 1050)] = 'VIDEO_PROFILE_PORTRAIT_720P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_720P_3 = 1052)] = 'VIDEO_PROFILE_PORTRAIT_720P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_720P_5 = 1054)] = 'VIDEO_PROFILE_PORTRAIT_720P_5'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_720P_6 = 1055)] = 'VIDEO_PROFILE_PORTRAIT_720P_6'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_1080P = 1060)] = 'VIDEO_PROFILE_PORTRAIT_1080P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_1080P_3 = 1062)] = 'VIDEO_PROFILE_PORTRAIT_1080P_3'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_1080P_5 = 1064)] = 'VIDEO_PROFILE_PORTRAIT_1080P_5'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_1440P = 1066)] = 'VIDEO_PROFILE_PORTRAIT_1440P'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_1440P_2 = 1067)] = 'VIDEO_PROFILE_PORTRAIT_1440P_2'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_4K = 1070)] = 'VIDEO_PROFILE_PORTRAIT_4K'),
              (Z[(Z.VIDEO_PROFILE_PORTRAIT_4K_3 = 1072)] = 'VIDEO_PROFILE_PORTRAIT_4K_3'),
              (Z[(Z.VIDEO_PROFILE_DEFAULT = 30)] = 'VIDEO_PROFILE_DEFAULT'),
              ((Q = E.AUDIO_PROFILE_TYPE || (E.AUDIO_PROFILE_TYPE = {}))[
                (Q.AUDIO_PROFILE_DEFAULT = 0)
              ] = 'AUDIO_PROFILE_DEFAULT'),
              (Q[(Q.AUDIO_PROFILE_SPEECH_STANDARD = 1)] = 'AUDIO_PROFILE_SPEECH_STANDARD'),
              (Q[(Q.AUDIO_PROFILE_MUSIC_STANDARD = 2)] = 'AUDIO_PROFILE_MUSIC_STANDARD'),
              (Q[(Q.AUDIO_PROFILE_MUSIC_STANDARD_STEREO = 3)] =
                'AUDIO_PROFILE_MUSIC_STANDARD_STEREO'),
              (Q[(Q.AUDIO_PROFILE_MUSIC_HIGH_QUALITY = 4)] = 'AUDIO_PROFILE_MUSIC_HIGH_QUALITY'),
              (Q[(Q.AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO = 5)] =
                'AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO'),
              (Q[(Q.AUDIO_PROFILE_IOT = 6)] = 'AUDIO_PROFILE_IOT'),
              (Q[(Q.AUDIO_PROFILE_NUM = 7)] = 'AUDIO_PROFILE_NUM'),
              ((J = E.AUDIO_SCENARIO_TYPE || (E.AUDIO_SCENARIO_TYPE = {}))[
                (J.AUDIO_SCENARIO_DEFAULT = 0)
              ] = 'AUDIO_SCENARIO_DEFAULT'),
              (J[(J.AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT = 1)] =
                'AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT'),
              (J[(J.AUDIO_SCENARIO_EDUCATION = 2)] = 'AUDIO_SCENARIO_EDUCATION'),
              (J[(J.AUDIO_SCENARIO_GAME_STREAMING = 3)] = 'AUDIO_SCENARIO_GAME_STREAMING'),
              (J[(J.AUDIO_SCENARIO_SHOWROOM = 4)] = 'AUDIO_SCENARIO_SHOWROOM'),
              (J[(J.AUDIO_SCENARIO_CHATROOM_GAMING = 5)] = 'AUDIO_SCENARIO_CHATROOM_GAMING'),
              (J[(J.AUDIO_SCENARIO_IOT = 6)] = 'AUDIO_SCENARIO_IOT'),
              (J[(J.AUDIO_SCENARIO_NUM = 7)] = 'AUDIO_SCENARIO_NUM'),
              ((x = E.CHANNEL_PROFILE_TYPE || (E.CHANNEL_PROFILE_TYPE = {}))[
                (x.CHANNEL_PROFILE_COMMUNICATION = 0)
              ] = 'CHANNEL_PROFILE_COMMUNICATION'),
              (x[(x.CHANNEL_PROFILE_LIVE_BROADCASTING = 1)] = 'CHANNEL_PROFILE_LIVE_BROADCASTING'),
              (x[(x.CHANNEL_PROFILE_GAME = 2)] = 'CHANNEL_PROFILE_GAME'),
              ((w = E.CLIENT_ROLE_TYPE || (E.CLIENT_ROLE_TYPE = {}))[
                (w.CLIENT_ROLE_BROADCASTER = 1)
              ] = 'CLIENT_ROLE_BROADCASTER'),
              (w[(w.CLIENT_ROLE_AUDIENCE = 2)] = 'CLIENT_ROLE_AUDIENCE'),
              ((y = E.AUDIENCE_LATENCY_LEVEL_TYPE || (E.AUDIENCE_LATENCY_LEVEL_TYPE = {}))[
                (y.AUDIENCE_LATENCY_LEVEL_LOW_LATENCY = 1)
              ] = 'AUDIENCE_LATENCY_LEVEL_LOW_LATENCY'),
              (y[(y.AUDIENCE_LATENCY_LEVEL_ULTRA_LOW_LATENCY = 2)] =
                'AUDIENCE_LATENCY_LEVEL_ULTRA_LOW_LATENCY'),
              ((b = E.SUPER_RESOLUTION_STATE_REASON || (E.SUPER_RESOLUTION_STATE_REASON = {}))[
                (b.SR_STATE_REASON_SUCCESS = 0)
              ] = 'SR_STATE_REASON_SUCCESS'),
              (b[(b.SR_STATE_REASON_STREAM_OVER_LIMITATION = 1)] =
                'SR_STATE_REASON_STREAM_OVER_LIMITATION'),
              (b[(b.SR_STATE_REASON_USER_COUNT_OVER_LIMITATION = 2)] =
                'SR_STATE_REASON_USER_COUNT_OVER_LIMITATION'),
              (b[(b.SR_STATE_REASON_DEVICE_NOT_SUPPORTED = 3)] =
                'SR_STATE_REASON_DEVICE_NOT_SUPPORTED'),
              ((K = E.USER_OFFLINE_REASON_TYPE || (E.USER_OFFLINE_REASON_TYPE = {}))[
                (K.USER_OFFLINE_QUIT = 0)
              ] = 'USER_OFFLINE_QUIT'),
              (K[(K.USER_OFFLINE_DROPPED = 1)] = 'USER_OFFLINE_DROPPED'),
              (K[(K.USER_OFFLINE_BECOME_AUDIENCE = 2)] = 'USER_OFFLINE_BECOME_AUDIENCE'),
              ((X = E.RTMP_STREAM_PUBLISH_STATE || (E.RTMP_STREAM_PUBLISH_STATE = {}))[
                (X.RTMP_STREAM_PUBLISH_STATE_IDLE = 0)
              ] = 'RTMP_STREAM_PUBLISH_STATE_IDLE'),
              (X[(X.RTMP_STREAM_PUBLISH_STATE_CONNECTING = 1)] =
                'RTMP_STREAM_PUBLISH_STATE_CONNECTING'),
              (X[(X.RTMP_STREAM_PUBLISH_STATE_RUNNING = 2)] = 'RTMP_STREAM_PUBLISH_STATE_RUNNING'),
              (X[(X.RTMP_STREAM_PUBLISH_STATE_RECOVERING = 3)] =
                'RTMP_STREAM_PUBLISH_STATE_RECOVERING'),
              (X[(X.RTMP_STREAM_PUBLISH_STATE_FAILURE = 4)] = 'RTMP_STREAM_PUBLISH_STATE_FAILURE'),
              ((g = E.RTMP_STREAM_PUBLISH_ERROR || (E.RTMP_STREAM_PUBLISH_ERROR = {}))[
                (g.RTMP_STREAM_PUBLISH_ERROR_OK = 0)
              ] = 'RTMP_STREAM_PUBLISH_ERROR_OK'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_INVALID_ARGUMENT = 1)] =
                'RTMP_STREAM_PUBLISH_ERROR_INVALID_ARGUMENT'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_ENCRYPTED_STREAM_NOT_ALLOWED = 2)] =
                'RTMP_STREAM_PUBLISH_ERROR_ENCRYPTED_STREAM_NOT_ALLOWED'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_CONNECTION_TIMEOUT = 3)] =
                'RTMP_STREAM_PUBLISH_ERROR_CONNECTION_TIMEOUT'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_INTERNAL_SERVER_ERROR = 4)] =
                'RTMP_STREAM_PUBLISH_ERROR_INTERNAL_SERVER_ERROR'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_RTMP_SERVER_ERROR = 5)] =
                'RTMP_STREAM_PUBLISH_ERROR_RTMP_SERVER_ERROR'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_TOO_OFTEN = 6)] =
                'RTMP_STREAM_PUBLISH_ERROR_TOO_OFTEN'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_REACH_LIMIT = 7)] =
                'RTMP_STREAM_PUBLISH_ERROR_REACH_LIMIT'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_NOT_AUTHORIZED = 8)] =
                'RTMP_STREAM_PUBLISH_ERROR_NOT_AUTHORIZED'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_STREAM_NOT_FOUND = 9)] =
                'RTMP_STREAM_PUBLISH_ERROR_STREAM_NOT_FOUND'),
              (g[(g.RTMP_STREAM_PUBLISH_ERROR_FORMAT_NOT_SUPPORTED = 10)] =
                'RTMP_STREAM_PUBLISH_ERROR_FORMAT_NOT_SUPPORTED'),
              ((p = E.RTMP_STREAMING_EVENT || (E.RTMP_STREAMING_EVENT = {}))[
                (p.RTMP_STREAMING_EVENT_FAILED_LOAD_IMAGE = 1)
              ] = 'RTMP_STREAMING_EVENT_FAILED_LOAD_IMAGE'),
              ((v = E.INJECT_STREAM_STATUS || (E.INJECT_STREAM_STATUS = {}))[
                (v.INJECT_STREAM_STATUS_START_SUCCESS = 0)
              ] = 'INJECT_STREAM_STATUS_START_SUCCESS'),
              (v[(v.INJECT_STREAM_STATUS_START_ALREADY_EXISTS = 1)] =
                'INJECT_STREAM_STATUS_START_ALREADY_EXISTS'),
              (v[(v.INJECT_STREAM_STATUS_START_UNAUTHORIZED = 2)] =
                'INJECT_STREAM_STATUS_START_UNAUTHORIZED'),
              (v[(v.INJECT_STREAM_STATUS_START_TIMEDOUT = 3)] =
                'INJECT_STREAM_STATUS_START_TIMEDOUT'),
              (v[(v.INJECT_STREAM_STATUS_START_FAILED = 4)] = 'INJECT_STREAM_STATUS_START_FAILED'),
              (v[(v.INJECT_STREAM_STATUS_STOP_SUCCESS = 5)] = 'INJECT_STREAM_STATUS_STOP_SUCCESS'),
              (v[(v.INJECT_STREAM_STATUS_STOP_NOT_FOUND = 6)] =
                'INJECT_STREAM_STATUS_STOP_NOT_FOUND'),
              (v[(v.INJECT_STREAM_STATUS_STOP_UNAUTHORIZED = 7)] =
                'INJECT_STREAM_STATUS_STOP_UNAUTHORIZED'),
              (v[(v.INJECT_STREAM_STATUS_STOP_TIMEDOUT = 8)] =
                'INJECT_STREAM_STATUS_STOP_TIMEDOUT'),
              (v[(v.INJECT_STREAM_STATUS_STOP_FAILED = 9)] = 'INJECT_STREAM_STATUS_STOP_FAILED'),
              (v[(v.INJECT_STREAM_STATUS_BROKEN = 10)] = 'INJECT_STREAM_STATUS_BROKEN'),
              ((W = E.REMOTE_VIDEO_STREAM_TYPE || (E.REMOTE_VIDEO_STREAM_TYPE = {}))[
                (W.REMOTE_VIDEO_STREAM_HIGH = 0)
              ] = 'REMOTE_VIDEO_STREAM_HIGH'),
              (W[(W.REMOTE_VIDEO_STREAM_LOW = 1)] = 'REMOTE_VIDEO_STREAM_LOW'),
              ((m = E.RAW_AUDIO_FRAME_OP_MODE_TYPE || (E.RAW_AUDIO_FRAME_OP_MODE_TYPE = {}))[
                (m.RAW_AUDIO_FRAME_OP_MODE_READ_ONLY = 0)
              ] = 'RAW_AUDIO_FRAME_OP_MODE_READ_ONLY'),
              (m[(m.RAW_AUDIO_FRAME_OP_MODE_WRITE_ONLY = 1)] =
                'RAW_AUDIO_FRAME_OP_MODE_WRITE_ONLY'),
              (m[(m.RAW_AUDIO_FRAME_OP_MODE_READ_WRITE = 2)] =
                'RAW_AUDIO_FRAME_OP_MODE_READ_WRITE'),
              (function (E) {
                (E[(E.AUDIO_SAMPLE_RATE_32000 = 32e3)] = 'AUDIO_SAMPLE_RATE_32000'),
                  (E[(E.AUDIO_SAMPLE_RATE_44100 = 44100)] = 'AUDIO_SAMPLE_RATE_44100'),
                  (E[(E.AUDIO_SAMPLE_RATE_48000 = 48e3)] = 'AUDIO_SAMPLE_RATE_48000');
              })((A = E.AUDIO_SAMPLE_RATE_TYPE || (E.AUDIO_SAMPLE_RATE_TYPE = {}))),
              (function (E) {
                (E[(E.VIDEO_CODEC_PROFILE_BASELINE = 66)] = 'VIDEO_CODEC_PROFILE_BASELINE'),
                  (E[(E.VIDEO_CODEC_PROFILE_MAIN = 77)] = 'VIDEO_CODEC_PROFILE_MAIN'),
                  (E[(E.VIDEO_CODEC_PROFILE_HIGH = 100)] = 'VIDEO_CODEC_PROFILE_HIGH');
              })((T = E.VIDEO_CODEC_PROFILE_TYPE || (E.VIDEO_CODEC_PROFILE_TYPE = {}))),
              ((h = E.VIDEO_CODEC_TYPE || (E.VIDEO_CODEC_TYPE = {}))[(h.VIDEO_CODEC_VP8 = 1)] =
                'VIDEO_CODEC_VP8'),
              (h[(h.VIDEO_CODEC_H264 = 2)] = 'VIDEO_CODEC_H264'),
              (h[(h.VIDEO_CODEC_EVP = 3)] = 'VIDEO_CODEC_EVP'),
              (h[(h.VIDEO_CODEC_E264 = 4)] = 'VIDEO_CODEC_E264'),
              ((l = E.VIDEO_CODEC_TYPE_FOR_STREAM || (E.VIDEO_CODEC_TYPE_FOR_STREAM = {}))[
                (l.VIDEO_CODEC_H264_FOR_STREAM = 1)
              ] = 'VIDEO_CODEC_H264_FOR_STREAM'),
              (l[(l.VIDEO_CODEC_H265_FOR_STREAM = 2)] = 'VIDEO_CODEC_H265_FOR_STREAM'),
              ((H =
                E.AUDIO_EQUALIZATION_BAND_FREQUENCY || (E.AUDIO_EQUALIZATION_BAND_FREQUENCY = {}))[
                (H.AUDIO_EQUALIZATION_BAND_31 = 0)
              ] = 'AUDIO_EQUALIZATION_BAND_31'),
              (H[(H.AUDIO_EQUALIZATION_BAND_62 = 1)] = 'AUDIO_EQUALIZATION_BAND_62'),
              (H[(H.AUDIO_EQUALIZATION_BAND_125 = 2)] = 'AUDIO_EQUALIZATION_BAND_125'),
              (H[(H.AUDIO_EQUALIZATION_BAND_250 = 3)] = 'AUDIO_EQUALIZATION_BAND_250'),
              (H[(H.AUDIO_EQUALIZATION_BAND_500 = 4)] = 'AUDIO_EQUALIZATION_BAND_500'),
              (H[(H.AUDIO_EQUALIZATION_BAND_1K = 5)] = 'AUDIO_EQUALIZATION_BAND_1K'),
              (H[(H.AUDIO_EQUALIZATION_BAND_2K = 6)] = 'AUDIO_EQUALIZATION_BAND_2K'),
              (H[(H.AUDIO_EQUALIZATION_BAND_4K = 7)] = 'AUDIO_EQUALIZATION_BAND_4K'),
              (H[(H.AUDIO_EQUALIZATION_BAND_8K = 8)] = 'AUDIO_EQUALIZATION_BAND_8K'),
              (H[(H.AUDIO_EQUALIZATION_BAND_16K = 9)] = 'AUDIO_EQUALIZATION_BAND_16K'),
              ((Y = E.AUDIO_REVERB_TYPE || (E.AUDIO_REVERB_TYPE = {}))[
                (Y.AUDIO_REVERB_DRY_LEVEL = 0)
              ] = 'AUDIO_REVERB_DRY_LEVEL'),
              (Y[(Y.AUDIO_REVERB_WET_LEVEL = 1)] = 'AUDIO_REVERB_WET_LEVEL'),
              (Y[(Y.AUDIO_REVERB_ROOM_SIZE = 2)] = 'AUDIO_REVERB_ROOM_SIZE'),
              (Y[(Y.AUDIO_REVERB_WET_DELAY = 3)] = 'AUDIO_REVERB_WET_DELAY'),
              (Y[(Y.AUDIO_REVERB_STRENGTH = 4)] = 'AUDIO_REVERB_STRENGTH'),
              ((f = E.VOICE_CHANGER_PRESET || (E.VOICE_CHANGER_PRESET = {}))[
                (f.VOICE_CHANGER_OFF = 0)
              ] = 'VOICE_CHANGER_OFF'),
              (f[(f.VOICE_CHANGER_OLDMAN = 1)] = 'VOICE_CHANGER_OLDMAN'),
              (f[(f.VOICE_CHANGER_BABYBOY = 2)] = 'VOICE_CHANGER_BABYBOY'),
              (f[(f.VOICE_CHANGER_BABYGIRL = 3)] = 'VOICE_CHANGER_BABYGIRL'),
              (f[(f.VOICE_CHANGER_ZHUBAJIE = 4)] = 'VOICE_CHANGER_ZHUBAJIE'),
              (f[(f.VOICE_CHANGER_ETHEREAL = 5)] = 'VOICE_CHANGER_ETHEREAL'),
              (f[(f.VOICE_CHANGER_HULK = 6)] = 'VOICE_CHANGER_HULK'),
              (f[(f.VOICE_BEAUTY_VIGOROUS = 1048577)] = 'VOICE_BEAUTY_VIGOROUS'),
              (f[(f.VOICE_BEAUTY_DEEP = 1048578)] = 'VOICE_BEAUTY_DEEP'),
              (f[(f.VOICE_BEAUTY_MELLOW = 1048579)] = 'VOICE_BEAUTY_MELLOW'),
              (f[(f.VOICE_BEAUTY_FALSETTO = 1048580)] = 'VOICE_BEAUTY_FALSETTO'),
              (f[(f.VOICE_BEAUTY_FULL = 1048581)] = 'VOICE_BEAUTY_FULL'),
              (f[(f.VOICE_BEAUTY_CLEAR = 1048582)] = 'VOICE_BEAUTY_CLEAR'),
              (f[(f.VOICE_BEAUTY_RESOUNDING = 1048583)] = 'VOICE_BEAUTY_RESOUNDING'),
              (f[(f.VOICE_BEAUTY_RINGING = 1048584)] = 'VOICE_BEAUTY_RINGING'),
              (f[(f.VOICE_BEAUTY_SPACIAL = 1048585)] = 'VOICE_BEAUTY_SPACIAL'),
              (f[(f.GENERAL_BEAUTY_VOICE_MALE_MAGNETIC = 2097153)] =
                'GENERAL_BEAUTY_VOICE_MALE_MAGNETIC'),
              (f[(f.GENERAL_BEAUTY_VOICE_FEMALE_FRESH = 2097154)] =
                'GENERAL_BEAUTY_VOICE_FEMALE_FRESH'),
              (f[(f.GENERAL_BEAUTY_VOICE_FEMALE_VITALITY = 2097155)] =
                'GENERAL_BEAUTY_VOICE_FEMALE_VITALITY'),
              ((d = E.AUDIO_REVERB_PRESET || (E.AUDIO_REVERB_PRESET = {}))[
                (d.AUDIO_REVERB_OFF = 0)
              ] = 'AUDIO_REVERB_OFF'),
              (d[(d.AUDIO_REVERB_FX_KTV = 1048577)] = 'AUDIO_REVERB_FX_KTV'),
              (d[(d.AUDIO_REVERB_FX_VOCAL_CONCERT = 1048578)] = 'AUDIO_REVERB_FX_VOCAL_CONCERT'),
              (d[(d.AUDIO_REVERB_FX_UNCLE = 1048579)] = 'AUDIO_REVERB_FX_UNCLE'),
              (d[(d.AUDIO_REVERB_FX_SISTER = 1048580)] = 'AUDIO_REVERB_FX_SISTER'),
              (d[(d.AUDIO_REVERB_FX_STUDIO = 1048581)] = 'AUDIO_REVERB_FX_STUDIO'),
              (d[(d.AUDIO_REVERB_FX_POPULAR = 1048582)] = 'AUDIO_REVERB_FX_POPULAR'),
              (d[(d.AUDIO_REVERB_FX_RNB = 1048583)] = 'AUDIO_REVERB_FX_RNB'),
              (d[(d.AUDIO_REVERB_FX_PHONOGRAPH = 1048584)] = 'AUDIO_REVERB_FX_PHONOGRAPH'),
              (d[(d.AUDIO_REVERB_POPULAR = 1)] = 'AUDIO_REVERB_POPULAR'),
              (d[(d.AUDIO_REVERB_RNB = 2)] = 'AUDIO_REVERB_RNB'),
              (d[(d.AUDIO_REVERB_ROCK = 3)] = 'AUDIO_REVERB_ROCK'),
              (d[(d.AUDIO_REVERB_HIPHOP = 4)] = 'AUDIO_REVERB_HIPHOP'),
              (d[(d.AUDIO_REVERB_VOCAL_CONCERT = 5)] = 'AUDIO_REVERB_VOCAL_CONCERT'),
              (d[(d.AUDIO_REVERB_KTV = 6)] = 'AUDIO_REVERB_KTV'),
              (d[(d.AUDIO_REVERB_STUDIO = 7)] = 'AUDIO_REVERB_STUDIO'),
              (d[(d.AUDIO_VIRTUAL_STEREO = 2097153)] = 'AUDIO_VIRTUAL_STEREO'),
              ((B = E.VOICE_BEAUTIFIER_PRESET || (E.VOICE_BEAUTIFIER_PRESET = {}))[
                (B.VOICE_BEAUTIFIER_OFF = 0)
              ] = 'VOICE_BEAUTIFIER_OFF'),
              (B[(B.CHAT_BEAUTIFIER_MAGNETIC = 16843008)] = 'CHAT_BEAUTIFIER_MAGNETIC'),
              (B[(B.CHAT_BEAUTIFIER_FRESH = 16843264)] = 'CHAT_BEAUTIFIER_FRESH'),
              (B[(B.CHAT_BEAUTIFIER_VITALITY = 16843520)] = 'CHAT_BEAUTIFIER_VITALITY'),
              (B[(B.TIMBRE_TRANSFORMATION_VIGOROUS = 16974080)] = 'TIMBRE_TRANSFORMATION_VIGOROUS'),
              (B[(B.TIMBRE_TRANSFORMATION_DEEP = 16974336)] = 'TIMBRE_TRANSFORMATION_DEEP'),
              (B[(B.TIMBRE_TRANSFORMATION_MELLOW = 16974592)] = 'TIMBRE_TRANSFORMATION_MELLOW'),
              (B[(B.TIMBRE_TRANSFORMATION_FALSETTO = 16974848)] = 'TIMBRE_TRANSFORMATION_FALSETTO'),
              (B[(B.TIMBRE_TRANSFORMATION_FULL = 16975104)] = 'TIMBRE_TRANSFORMATION_FULL'),
              (B[(B.TIMBRE_TRANSFORMATION_CLEAR = 16975360)] = 'TIMBRE_TRANSFORMATION_CLEAR'),
              (B[(B.TIMBRE_TRANSFORMATION_RESOUNDING = 16975616)] =
                'TIMBRE_TRANSFORMATION_RESOUNDING'),
              (B[(B.TIMBRE_TRANSFORMATION_RINGING = 16975872)] = 'TIMBRE_TRANSFORMATION_RINGING'),
              ((s = E.AUDIO_EFFECT_PRESET || (E.AUDIO_EFFECT_PRESET = {}))[
                (s.AUDIO_EFFECT_OFF = 0)
              ] = 'AUDIO_EFFECT_OFF'),
              (s[(s.ROOM_ACOUSTICS_KTV = 33620224)] = 'ROOM_ACOUSTICS_KTV'),
              (s[(s.ROOM_ACOUSTICS_VOCAL_CONCERT = 33620480)] = 'ROOM_ACOUSTICS_VOCAL_CONCERT'),
              (s[(s.ROOM_ACOUSTICS_STUDIO = 33620736)] = 'ROOM_ACOUSTICS_STUDIO'),
              (s[(s.ROOM_ACOUSTICS_PHONOGRAPH = 33620992)] = 'ROOM_ACOUSTICS_PHONOGRAPH'),
              (s[(s.ROOM_ACOUSTICS_VIRTUAL_STEREO = 33621248)] = 'ROOM_ACOUSTICS_VIRTUAL_STEREO'),
              (s[(s.ROOM_ACOUSTICS_SPACIAL = 33621504)] = 'ROOM_ACOUSTICS_SPACIAL'),
              (s[(s.ROOM_ACOUSTICS_ETHEREAL = 33621760)] = 'ROOM_ACOUSTICS_ETHEREAL'),
              (s[(s.ROOM_ACOUSTICS_3D_VOICE = 33622016)] = 'ROOM_ACOUSTICS_3D_VOICE'),
              (s[(s.VOICE_CHANGER_EFFECT_UNCLE = 33685760)] = 'VOICE_CHANGER_EFFECT_UNCLE'),
              (s[(s.VOICE_CHANGER_EFFECT_OLDMAN = 33686016)] = 'VOICE_CHANGER_EFFECT_OLDMAN'),
              (s[(s.VOICE_CHANGER_EFFECT_BOY = 33686272)] = 'VOICE_CHANGER_EFFECT_BOY'),
              (s[(s.VOICE_CHANGER_EFFECT_SISTER = 33686528)] = 'VOICE_CHANGER_EFFECT_SISTER'),
              (s[(s.VOICE_CHANGER_EFFECT_GIRL = 33686784)] = 'VOICE_CHANGER_EFFECT_GIRL'),
              (s[(s.VOICE_CHANGER_EFFECT_PIGKING = 33687040)] = 'VOICE_CHANGER_EFFECT_PIGKING'),
              (s[(s.VOICE_CHANGER_EFFECT_HULK = 33687296)] = 'VOICE_CHANGER_EFFECT_HULK'),
              (s[(s.STYLE_TRANSFORMATION_RNB = 33751296)] = 'STYLE_TRANSFORMATION_RNB'),
              (s[(s.STYLE_TRANSFORMATION_POPULAR = 33751552)] = 'STYLE_TRANSFORMATION_POPULAR'),
              (s[(s.PITCH_CORRECTION = 33816832)] = 'PITCH_CORRECTION'),
              (function (E) {
                (E[(E.AUDIO_CODEC_PROFILE_LC_AAC = 0)] = 'AUDIO_CODEC_PROFILE_LC_AAC'),
                  (E[(E.AUDIO_CODEC_PROFILE_HE_AAC = 1)] = 'AUDIO_CODEC_PROFILE_HE_AAC');
              })((O = E.AUDIO_CODEC_PROFILE_TYPE || (E.AUDIO_CODEC_PROFILE_TYPE = {}))),
              ((c = E.REMOTE_AUDIO_STATE || (E.REMOTE_AUDIO_STATE = {}))[
                (c.REMOTE_AUDIO_STATE_STOPPED = 0)
              ] = 'REMOTE_AUDIO_STATE_STOPPED'),
              (c[(c.REMOTE_AUDIO_STATE_STARTING = 1)] = 'REMOTE_AUDIO_STATE_STARTING'),
              (c[(c.REMOTE_AUDIO_STATE_DECODING = 2)] = 'REMOTE_AUDIO_STATE_DECODING'),
              (c[(c.REMOTE_AUDIO_STATE_FROZEN = 3)] = 'REMOTE_AUDIO_STATE_FROZEN'),
              (c[(c.REMOTE_AUDIO_STATE_FAILED = 4)] = 'REMOTE_AUDIO_STATE_FAILED'),
              ((G = E.REMOTE_AUDIO_STATE_REASON || (E.REMOTE_AUDIO_STATE_REASON = {}))[
                (G.REMOTE_AUDIO_REASON_INTERNAL = 0)
              ] = 'REMOTE_AUDIO_REASON_INTERNAL'),
              (G[(G.REMOTE_AUDIO_REASON_NETWORK_CONGESTION = 1)] =
                'REMOTE_AUDIO_REASON_NETWORK_CONGESTION'),
              (G[(G.REMOTE_AUDIO_REASON_NETWORK_RECOVERY = 2)] =
                'REMOTE_AUDIO_REASON_NETWORK_RECOVERY'),
              (G[(G.REMOTE_AUDIO_REASON_LOCAL_MUTED = 3)] = 'REMOTE_AUDIO_REASON_LOCAL_MUTED'),
              (G[(G.REMOTE_AUDIO_REASON_LOCAL_UNMUTED = 4)] = 'REMOTE_AUDIO_REASON_LOCAL_UNMUTED'),
              (G[(G.REMOTE_AUDIO_REASON_REMOTE_MUTED = 5)] = 'REMOTE_AUDIO_REASON_REMOTE_MUTED'),
              (G[(G.REMOTE_AUDIO_REASON_REMOTE_UNMUTED = 6)] =
                'REMOTE_AUDIO_REASON_REMOTE_UNMUTED'),
              (G[(G.REMOTE_AUDIO_REASON_REMOTE_OFFLINE = 7)] =
                'REMOTE_AUDIO_REASON_REMOTE_OFFLINE'),
              ((F = E.REMOTE_VIDEO_STATE || (E.REMOTE_VIDEO_STATE = {}))[
                (F.REMOTE_VIDEO_STATE_STOPPED = 0)
              ] = 'REMOTE_VIDEO_STATE_STOPPED'),
              (F[(F.REMOTE_VIDEO_STATE_STARTING = 1)] = 'REMOTE_VIDEO_STATE_STARTING'),
              (F[(F.REMOTE_VIDEO_STATE_DECODING = 2)] = 'REMOTE_VIDEO_STATE_DECODING'),
              (F[(F.REMOTE_VIDEO_STATE_FROZEN = 3)] = 'REMOTE_VIDEO_STATE_FROZEN'),
              (F[(F.REMOTE_VIDEO_STATE_FAILED = 4)] = 'REMOTE_VIDEO_STATE_FAILED'),
              ((u = E.STREAM_PUBLISH_STATE || (E.STREAM_PUBLISH_STATE = {}))[
                (u.PUB_STATE_IDLE = 0)
              ] = 'PUB_STATE_IDLE'),
              (u[(u.PUB_STATE_NO_PUBLISHED = 1)] = 'PUB_STATE_NO_PUBLISHED'),
              (u[(u.PUB_STATE_PUBLISHING = 2)] = 'PUB_STATE_PUBLISHING'),
              (u[(u.PUB_STATE_PUBLISHED = 3)] = 'PUB_STATE_PUBLISHED'),
              ((a = E.STREAM_SUBSCRIBE_STATE || (E.STREAM_SUBSCRIBE_STATE = {}))[
                (a.SUB_STATE_IDLE = 0)
              ] = 'SUB_STATE_IDLE'),
              (a[(a.SUB_STATE_NO_SUBSCRIBED = 1)] = 'SUB_STATE_NO_SUBSCRIBED'),
              (a[(a.SUB_STATE_SUBSCRIBING = 2)] = 'SUB_STATE_SUBSCRIBING'),
              (a[(a.SUB_STATE_SUBSCRIBED = 3)] = 'SUB_STATE_SUBSCRIBED'),
              ((V = E.XLA_REMOTE_VIDEO_FROZEN_TYPE || (E.XLA_REMOTE_VIDEO_FROZEN_TYPE = {}))[
                (V.XLA_REMOTE_VIDEO_FROZEN_500MS = 0)
              ] = 'XLA_REMOTE_VIDEO_FROZEN_500MS'),
              (V[(V.XLA_REMOTE_VIDEO_FROZEN_200MS = 1)] = 'XLA_REMOTE_VIDEO_FROZEN_200MS'),
              (V[(V.XLA_REMOTE_VIDEO_FROZEN_600MS = 2)] = 'XLA_REMOTE_VIDEO_FROZEN_600MS'),
              (V[(V.XLA_REMOTE_VIDEO_FROZEN_TYPE_MAX = 3)] = 'XLA_REMOTE_VIDEO_FROZEN_TYPE_MAX'),
              ((o = E.XLA_REMOTE_AUDIO_FROZEN_TYPE || (E.XLA_REMOTE_AUDIO_FROZEN_TYPE = {}))[
                (o.XLA_REMOTE_AUDIO_FROZEN_80MS = 0)
              ] = 'XLA_REMOTE_AUDIO_FROZEN_80MS'),
              (o[(o.XLA_REMOTE_AUDIO_FROZEN_200MS = 1)] = 'XLA_REMOTE_AUDIO_FROZEN_200MS'),
              (o[(o.XLA_REMOTE_AUDIO_FROZEN_TYPE_MAX = 2)] = 'XLA_REMOTE_AUDIO_FROZEN_TYPE_MAX'),
              ((i = E.REMOTE_VIDEO_STATE_REASON || (E.REMOTE_VIDEO_STATE_REASON = {}))[
                (i.REMOTE_VIDEO_STATE_REASON_INTERNAL = 0)
              ] = 'REMOTE_VIDEO_STATE_REASON_INTERNAL'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION = 1)] =
                'REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY = 2)] =
                'REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED = 3)] =
                'REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED = 4)] =
                'REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED = 5)] =
                'REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED = 6)] =
                'REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE = 7)] =
                'REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK = 8)] =
                'REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK'),
              (i[(i.REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY = 9)] =
                'REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY'),
              (function (E) {
                (E[(E.FRAME_RATE_FPS_1 = 1)] = 'FRAME_RATE_FPS_1'),
                  (E[(E.FRAME_RATE_FPS_7 = 7)] = 'FRAME_RATE_FPS_7'),
                  (E[(E.FRAME_RATE_FPS_10 = 10)] = 'FRAME_RATE_FPS_10'),
                  (E[(E.FRAME_RATE_FPS_15 = 15)] = 'FRAME_RATE_FPS_15'),
                  (E[(E.FRAME_RATE_FPS_24 = 24)] = 'FRAME_RATE_FPS_24'),
                  (E[(E.FRAME_RATE_FPS_30 = 30)] = 'FRAME_RATE_FPS_30'),
                  (E[(E.FRAME_RATE_FPS_60 = 60)] = 'FRAME_RATE_FPS_60');
              })((I = E.FRAME_RATE || (E.FRAME_RATE = {}))),
              (function (E) {
                (E[(E.ORIENTATION_MODE_ADAPTIVE = 0)] = 'ORIENTATION_MODE_ADAPTIVE'),
                  (E[(E.ORIENTATION_MODE_FIXED_LANDSCAPE = 1)] =
                    'ORIENTATION_MODE_FIXED_LANDSCAPE'),
                  (E[(E.ORIENTATION_MODE_FIXED_PORTRAIT = 2)] = 'ORIENTATION_MODE_FIXED_PORTRAIT');
              })((N = E.ORIENTATION_MODE || (E.ORIENTATION_MODE = {}))),
              (function (E) {
                (E[(E.MAINTAIN_QUALITY = 0)] = 'MAINTAIN_QUALITY'),
                  (E[(E.MAINTAIN_FRAMERATE = 1)] = 'MAINTAIN_FRAMERATE'),
                  (E[(E.MAINTAIN_BALANCED = 2)] = 'MAINTAIN_BALANCED');
              })((D = E.DEGRADATION_PREFERENCE || (E.DEGRADATION_PREFERENCE = {}))),
              ((r = E.STREAM_FALLBACK_OPTIONS || (E.STREAM_FALLBACK_OPTIONS = {}))[
                (r.STREAM_FALLBACK_OPTION_DISABLED = 0)
              ] = 'STREAM_FALLBACK_OPTION_DISABLED'),
              (r[(r.STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW = 1)] =
                'STREAM_FALLBACK_OPTION_VIDEO_STREAM_LOW'),
              (r[(r.STREAM_FALLBACK_OPTION_AUDIO_ONLY = 2)] = 'STREAM_FALLBACK_OPTION_AUDIO_ONLY'),
              ((M = E.CAPTURER_OUTPUT_PREFERENCE || (E.CAPTURER_OUTPUT_PREFERENCE = {}))[
                (M.CAPTURER_OUTPUT_PREFERENCE_AUTO = 0)
              ] = 'CAPTURER_OUTPUT_PREFERENCE_AUTO'),
              (M[(M.CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1)] =
                'CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE'),
              (M[(M.CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2)] =
                'CAPTURER_OUTPUT_PREFERENCE_PREVIEW'),
              ((n = E.PRIORITY_TYPE || (E.PRIORITY_TYPE = {}))[(n.PRIORITY_HIGH = 50)] =
                'PRIORITY_HIGH'),
              (n[(n.PRIORITY_NORMAL = 100)] = 'PRIORITY_NORMAL'),
              ((U = E.CONNECTION_STATE_TYPE || (E.CONNECTION_STATE_TYPE = {}))[
                (U.CONNECTION_STATE_DISCONNECTED = 1)
              ] = 'CONNECTION_STATE_DISCONNECTED'),
              (U[(U.CONNECTION_STATE_CONNECTING = 2)] = 'CONNECTION_STATE_CONNECTING'),
              (U[(U.CONNECTION_STATE_CONNECTED = 3)] = 'CONNECTION_STATE_CONNECTED'),
              (U[(U.CONNECTION_STATE_RECONNECTING = 4)] = 'CONNECTION_STATE_RECONNECTING'),
              (U[(U.CONNECTION_STATE_FAILED = 5)] = 'CONNECTION_STATE_FAILED'),
              ((P = E.CONNECTION_CHANGED_REASON_TYPE || (E.CONNECTION_CHANGED_REASON_TYPE = {}))[
                (P.CONNECTION_CHANGED_CONNECTING = 0)
              ] = 'CONNECTION_CHANGED_CONNECTING'),
              (P[(P.CONNECTION_CHANGED_JOIN_SUCCESS = 1)] = 'CONNECTION_CHANGED_JOIN_SUCCESS'),
              (P[(P.CONNECTION_CHANGED_INTERRUPTED = 2)] = 'CONNECTION_CHANGED_INTERRUPTED'),
              (P[(P.CONNECTION_CHANGED_BANNED_BY_SERVER = 3)] =
                'CONNECTION_CHANGED_BANNED_BY_SERVER'),
              (P[(P.CONNECTION_CHANGED_JOIN_FAILED = 4)] = 'CONNECTION_CHANGED_JOIN_FAILED'),
              (P[(P.CONNECTION_CHANGED_LEAVE_CHANNEL = 5)] = 'CONNECTION_CHANGED_LEAVE_CHANNEL'),
              (P[(P.CONNECTION_CHANGED_INVALID_APP_ID = 6)] = 'CONNECTION_CHANGED_INVALID_APP_ID'),
              (P[(P.CONNECTION_CHANGED_INVALID_CHANNEL_NAME = 7)] =
                'CONNECTION_CHANGED_INVALID_CHANNEL_NAME'),
              (P[(P.CONNECTION_CHANGED_INVALID_TOKEN = 8)] = 'CONNECTION_CHANGED_INVALID_TOKEN'),
              (P[(P.CONNECTION_CHANGED_TOKEN_EXPIRED = 9)] = 'CONNECTION_CHANGED_TOKEN_EXPIRED'),
              (P[(P.CONNECTION_CHANGED_REJECTED_BY_SERVER = 10)] =
                'CONNECTION_CHANGED_REJECTED_BY_SERVER'),
              (P[(P.CONNECTION_CHANGED_SETTING_PROXY_SERVER = 11)] =
                'CONNECTION_CHANGED_SETTING_PROXY_SERVER'),
              (P[(P.CONNECTION_CHANGED_RENEW_TOKEN = 12)] = 'CONNECTION_CHANGED_RENEW_TOKEN'),
              (P[(P.CONNECTION_CHANGED_CLIENT_IP_ADDRESS_CHANGED = 13)] =
                'CONNECTION_CHANGED_CLIENT_IP_ADDRESS_CHANGED'),
              (P[(P.CONNECTION_CHANGED_KEEP_ALIVE_TIMEOUT = 14)] =
                'CONNECTION_CHANGED_KEEP_ALIVE_TIMEOUT'),
              ((t = E.NETWORK_TYPE || (E.NETWORK_TYPE = {}))[(t.NETWORK_TYPE_UNKNOWN = -1)] =
                'NETWORK_TYPE_UNKNOWN'),
              (t[(t.NETWORK_TYPE_DISCONNECTED = 0)] = 'NETWORK_TYPE_DISCONNECTED'),
              (t[(t.NETWORK_TYPE_LAN = 1)] = 'NETWORK_TYPE_LAN'),
              (t[(t.NETWORK_TYPE_WIFI = 2)] = 'NETWORK_TYPE_WIFI'),
              (t[(t.NETWORK_TYPE_MOBILE_2G = 3)] = 'NETWORK_TYPE_MOBILE_2G'),
              (t[(t.NETWORK_TYPE_MOBILE_3G = 4)] = 'NETWORK_TYPE_MOBILE_3G'),
              (t[(t.NETWORK_TYPE_MOBILE_4G = 5)] = 'NETWORK_TYPE_MOBILE_4G'),
              ((C = E.LASTMILE_PROBE_RESULT_STATE || (E.LASTMILE_PROBE_RESULT_STATE = {}))[
                (C.LASTMILE_PROBE_RESULT_COMPLETE = 1)
              ] = 'LASTMILE_PROBE_RESULT_COMPLETE'),
              (C[(C.LASTMILE_PROBE_RESULT_INCOMPLETE_NO_BWE = 2)] =
                'LASTMILE_PROBE_RESULT_INCOMPLETE_NO_BWE'),
              (C[(C.LASTMILE_PROBE_RESULT_UNAVAILABLE = 3)] = 'LASTMILE_PROBE_RESULT_UNAVAILABLE'),
              ((e = E.AUDIO_ROUTE_TYPE || (E.AUDIO_ROUTE_TYPE = {}))[(e.AUDIO_ROUTE_DEFAULT = -1)] =
                'AUDIO_ROUTE_DEFAULT'),
              (e[(e.AUDIO_ROUTE_HEADSET = 0)] = 'AUDIO_ROUTE_HEADSET'),
              (e[(e.AUDIO_ROUTE_EARPIECE = 1)] = 'AUDIO_ROUTE_EARPIECE'),
              (e[(e.AUDIO_ROUTE_HEADSET_NO_MIC = 2)] = 'AUDIO_ROUTE_HEADSET_NO_MIC'),
              (e[(e.AUDIO_ROUTE_SPEAKERPHONE = 3)] = 'AUDIO_ROUTE_SPEAKERPHONE'),
              (e[(e.AUDIO_ROUTE_LOUDSPEAKER = 4)] = 'AUDIO_ROUTE_LOUDSPEAKER'),
              (e[(e.AUDIO_ROUTE_BLUETOOTH = 5)] = 'AUDIO_ROUTE_BLUETOOTH'),
              (e[(e.AUDIO_ROUTE_USB = 6)] = 'AUDIO_ROUTE_USB'),
              (e[(e.AUDIO_ROUTE_HDMI = 7)] = 'AUDIO_ROUTE_HDMI'),
              (e[(e.AUDIO_ROUTE_DISPLAYPORT = 8)] = 'AUDIO_ROUTE_DISPLAYPORT'),
              (e[(e.AUDIO_ROUTE_AIRPLAY = 9)] = 'AUDIO_ROUTE_AIRPLAY'),
              ((L =
                E.AUDIO_SESSION_OPERATION_RESTRICTION ||
                (E.AUDIO_SESSION_OPERATION_RESTRICTION = {}))[
                (L.AUDIO_SESSION_OPERATION_RESTRICTION_NONE = 0)
              ] = 'AUDIO_SESSION_OPERATION_RESTRICTION_NONE'),
              (L[(L.AUDIO_SESSION_OPERATION_RESTRICTION_SET_CATEGORY = 1)] =
                'AUDIO_SESSION_OPERATION_RESTRICTION_SET_CATEGORY'),
              (L[(L.AUDIO_SESSION_OPERATION_RESTRICTION_CONFIGURE_SESSION = 2)] =
                'AUDIO_SESSION_OPERATION_RESTRICTION_CONFIGURE_SESSION'),
              (L[(L.AUDIO_SESSION_OPERATION_RESTRICTION_DEACTIVATE_SESSION = 4)] =
                'AUDIO_SESSION_OPERATION_RESTRICTION_DEACTIVATE_SESSION'),
              (L[(L.AUDIO_SESSION_OPERATION_RESTRICTION_ALL = 128)] =
                'AUDIO_SESSION_OPERATION_RESTRICTION_ALL'),
              ((S = E.CAMERA_DIRECTION || (E.CAMERA_DIRECTION = {}))[(S.CAMERA_REAR = 0)] =
                'CAMERA_REAR'),
              (S[(S.CAMERA_FRONT = 1)] = 'CAMERA_FRONT');
            var LE, eE, CE, tE;
            (E.ClientRoleOptions = function (E) {
              this.audienceLatencyLevel = E;
            }),
              ((tE = E.QUALITY_ADAPT_INDICATION || (E.QUALITY_ADAPT_INDICATION = {}))[
                (tE.ADAPT_NONE = 0)
              ] = 'ADAPT_NONE'),
              (tE[(tE.ADAPT_UP_BANDWIDTH = 1)] = 'ADAPT_UP_BANDWIDTH'),
              (tE[(tE.ADAPT_DOWN_BANDWIDTH = 2)] = 'ADAPT_DOWN_BANDWIDTH'),
              ((CE = E.CHANNEL_MEDIA_RELAY_ERROR || (E.CHANNEL_MEDIA_RELAY_ERROR = {}))[
                (CE.RELAY_OK = 0)
              ] = 'RELAY_OK'),
              (CE[(CE.RELAY_ERROR_SERVER_ERROR_RESPONSE = 1)] =
                'RELAY_ERROR_SERVER_ERROR_RESPONSE'),
              (CE[(CE.RELAY_ERROR_SERVER_NO_RESPONSE = 2)] = 'RELAY_ERROR_SERVER_NO_RESPONSE'),
              (CE[(CE.RELAY_ERROR_NO_RESOURCE_AVAILABLE = 3)] =
                'RELAY_ERROR_NO_RESOURCE_AVAILABLE'),
              (CE[(CE.RELAY_ERROR_FAILED_JOIN_SRC = 4)] = 'RELAY_ERROR_FAILED_JOIN_SRC'),
              (CE[(CE.RELAY_ERROR_FAILED_JOIN_DEST = 5)] = 'RELAY_ERROR_FAILED_JOIN_DEST'),
              (CE[(CE.RELAY_ERROR_FAILED_PACKET_RECEIVED_FROM_SRC = 6)] =
                'RELAY_ERROR_FAILED_PACKET_RECEIVED_FROM_SRC'),
              (CE[(CE.RELAY_ERROR_FAILED_PACKET_SENT_TO_DEST = 7)] =
                'RELAY_ERROR_FAILED_PACKET_SENT_TO_DEST'),
              (CE[(CE.RELAY_ERROR_SERVER_CONNECTION_LOST = 8)] =
                'RELAY_ERROR_SERVER_CONNECTION_LOST'),
              (CE[(CE.RELAY_ERROR_INTERNAL_ERROR = 9)] = 'RELAY_ERROR_INTERNAL_ERROR'),
              (CE[(CE.RELAY_ERROR_SRC_TOKEN_EXPIRED = 10)] = 'RELAY_ERROR_SRC_TOKEN_EXPIRED'),
              (CE[(CE.RELAY_ERROR_DEST_TOKEN_EXPIRED = 11)] = 'RELAY_ERROR_DEST_TOKEN_EXPIRED'),
              ((eE = E.CHANNEL_MEDIA_RELAY_EVENT || (E.CHANNEL_MEDIA_RELAY_EVENT = {}))[
                (eE.RELAY_EVENT_NETWORK_DISCONNECTED = 0)
              ] = 'RELAY_EVENT_NETWORK_DISCONNECTED'),
              (eE[(eE.RELAY_EVENT_NETWORK_CONNECTED = 1)] = 'RELAY_EVENT_NETWORK_CONNECTED'),
              (eE[(eE.RELAY_EVENT_PACKET_JOINED_SRC_CHANNEL = 2)] =
                'RELAY_EVENT_PACKET_JOINED_SRC_CHANNEL'),
              (eE[(eE.RELAY_EVENT_PACKET_JOINED_DEST_CHANNEL = 3)] =
                'RELAY_EVENT_PACKET_JOINED_DEST_CHANNEL'),
              (eE[(eE.RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL = 4)] =
                'RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL'),
              (eE[(eE.RELAY_EVENT_PACKET_RECEIVED_VIDEO_FROM_SRC = 5)] =
                'RELAY_EVENT_PACKET_RECEIVED_VIDEO_FROM_SRC'),
              (eE[(eE.RELAY_EVENT_PACKET_RECEIVED_AUDIO_FROM_SRC = 6)] =
                'RELAY_EVENT_PACKET_RECEIVED_AUDIO_FROM_SRC'),
              (eE[(eE.RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL = 7)] =
                'RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL'),
              (eE[(eE.RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_REFUSED = 8)] =
                'RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_REFUSED'),
              (eE[(eE.RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE = 9)] =
                'RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE'),
              (eE[(eE.RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_IS_NULL = 10)] =
                'RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_IS_NULL'),
              (eE[(eE.RELAY_EVENT_VIDEO_PROFILE_UPDATE = 11)] = 'RELAY_EVENT_VIDEO_PROFILE_UPDATE'),
              ((LE = E.CHANNEL_MEDIA_RELAY_STATE || (E.CHANNEL_MEDIA_RELAY_STATE = {}))[
                (LE.RELAY_STATE_IDLE = 0)
              ] = 'RELAY_STATE_IDLE'),
              (LE[(LE.RELAY_STATE_CONNECTING = 1)] = 'RELAY_STATE_CONNECTING'),
              (LE[(LE.RELAY_STATE_RUNNING = 2)] = 'RELAY_STATE_RUNNING'),
              (LE[(LE.RELAY_STATE_FAILURE = 3)] = 'RELAY_STATE_FAILURE');
            var PE = function (E, _) {
              void 0 === E && (E = 640),
                void 0 === _ && (_ = 480),
                (this.width = E),
                (this.height = _);
            };
            (E.VideoDimensions = PE),
              (E.STANDARD_BITRATE = 0),
              (E.COMPATIBLE_BITRATE = -1),
              (E.DEFAULT_MIN_BITRATE = -1);
            E.VideoEncoderConfiguration = function (_, A, T, O, S, L, e, C) {
              void 0 === _ && (_ = new PE()),
                void 0 === A && (A = I.FRAME_RATE_FPS_15),
                void 0 === T && (T = -1),
                void 0 === O && (O = E.STANDARD_BITRATE),
                void 0 === S && (S = E.DEFAULT_MIN_BITRATE),
                void 0 === L && (L = N.ORIENTATION_MODE_ADAPTIVE),
                void 0 === e && (e = D.MAINTAIN_QUALITY),
                void 0 === C && (C = R.VIDEO_MIRROR_MODE_AUTO),
                (this.dimensions = _),
                (this.frameRate = A),
                (this.minFrameRate = T),
                (this.bitrate = O),
                (this.minBitrate = S),
                (this.orientationMode = L),
                (this.degradationPreference = e),
                (this.mirrorMode = C);
            };
            E.TranscodingUser = function (E, _, R, A, T, O, I, N) {
              void 0 === I && (I = 1),
                (this.uid = E),
                (this.x = _),
                (this.y = R),
                (this.width = A),
                (this.height = T),
                (this.zOrder = O),
                (this.alpha = I),
                (this.audioChannel = N);
            };
            E.RtcImage = function (E, _, R, A, T) {
              (this.url = E), (this.x = _), (this.y = R), (this.width = A), (this.height = T);
            };
            var UE = (function () {
              function E(E, _) {
                (this.featureName = E), (this.opened = _);
              }
              return (E.LBHQ = 'lbhq'), (E.VEO = 'veo'), E;
            })();
            E.LiveStreamAdvancedFeature = UE;
            E.LiveTranscoding = function (
              E,
              _,
              R,
              I,
              N,
              D,
              S,
              L,
              e,
              C,
              t,
              P,
              U,
              n,
              M,
              r,
              i,
              o,
              V,
              a,
            ) {
              void 0 === E && (E = 360),
                void 0 === _ && (_ = 640),
                void 0 === R && (R = 400),
                void 0 === I && (I = 15),
                void 0 === N && (N = !1),
                void 0 === D && (D = 30),
                void 0 === S && (S = T.VIDEO_CODEC_PROFILE_HIGH),
                void 0 === L && (L = 0),
                void 0 === e && (e = 0),
                void 0 === M && (M = A.AUDIO_SAMPLE_RATE_48000),
                void 0 === r && (r = 48),
                void 0 === i && (i = 1),
                void 0 === o && (o = O.AUDIO_CODEC_PROFILE_LC_AAC),
                void 0 === a && (a = 0),
                (this.width = E),
                (this.height = _),
                (this.videoBitrate = R),
                (this.videoFramerate = I),
                (this.lowLatency = N),
                (this.videoGop = D),
                (this.videoCodecProfile = S),
                (this.backgroundColor = L),
                (this.userCount = e),
                (this.transcodingUsers = C),
                (this.transcodingExtraInfo = t),
                (this.metadata = P),
                (this.watermark = U),
                (this.backgroundImage = n),
                (this.audioSampleRate = M),
                (this.audioBitrate = r),
                (this.audioChannels = i),
                (this.audioCodecProfile = o),
                (this.advancedFeatures = V),
                (this.advancedFeatureCount = a);
            };
            E.CameraCapturerConfiguration = function (E, _) {
              (this.preference = E), (this.cameraDirection = _);
            };
            E.InjectStreamConfig = function (E, _, R, T, O, I, N, D) {
              void 0 === E && (E = 0),
                void 0 === _ && (_ = 0),
                void 0 === R && (R = 30),
                void 0 === T && (T = 15),
                void 0 === O && (O = 400),
                void 0 === I && (I = A.AUDIO_SAMPLE_RATE_48000),
                void 0 === N && (N = 48),
                void 0 === D && (D = 1),
                (this.width = E),
                (this.height = _),
                (this.videoGop = R),
                (this.videoFramerate = T),
                (this.videoBitrate = O),
                (this.audioSampleRate = I),
                (this.audioBitrate = N),
                (this.audioChannels = D);
            };
            E.ChannelMediaInfo = function (E, _, R) {
              (this.channelName = E), (this.token = _), (this.uid = R);
            };
            var nE, ME;
            (E.ChannelMediaRelayConfiguration = function (E, _, R) {
              (this.srcInfo = E), (this.destInfos = _), (this.destCount = R);
            }),
              ((ME = E.RTMP_STREAM_LIFE_CYCLE_TYPE || (E.RTMP_STREAM_LIFE_CYCLE_TYPE = {}))[
                (ME.RTMP_STREAM_LIFE_CYCLE_BIND2CHANNEL = 1)
              ] = 'RTMP_STREAM_LIFE_CYCLE_BIND2CHANNEL'),
              (ME[(ME.RTMP_STREAM_LIFE_CYCLE_BIND2OWNER = 2)] =
                'RTMP_STREAM_LIFE_CYCLE_BIND2OWNER'),
              ((nE = E.VideoContentHint || (E.VideoContentHint = {}))[(nE.CONTENT_HINT_NONE = 0)] =
                'CONTENT_HINT_NONE'),
              (nE[(nE.CONTENT_HINT_MOTION = 1)] = 'CONTENT_HINT_MOTION'),
              (nE[(nE.CONTENT_HINT_DETAILS = 2)] = 'CONTENT_HINT_DETAILS');
            var rE = function (E, _, R, A) {
              void 0 === E && (E = 0),
                void 0 === _ && (_ = 0),
                void 0 === R && (R = 0),
                void 0 === A && (A = 0),
                (this.x = E),
                (this.y = _),
                (this.width = R),
                (this.height = A);
            };
            E.Rectangle = rE;
            E.Rect = function (E, _, R, A) {
              void 0 === E && (E = 0),
                void 0 === _ && (_ = 0),
                void 0 === R && (R = 0),
                void 0 === A && (A = 0),
                (this.top = E),
                (this.left = _),
                (this.bottom = R),
                (this.right = A);
            };
            E.WatermarkOptions = function (E, _, R) {
              void 0 === E && (E = !0),
                void 0 === _ && (_ = new rE()),
                void 0 === R && (R = new rE()),
                (this.visibleInPreview = E),
                (this.positionInLandscapeMode = _),
                (this.positionInPortraitMode = R);
            };
            E.ScreenCaptureParameters = function (_, R, A, T, O, I, N) {
              void 0 === _ && (_ = new PE(1920, 1080)),
                void 0 === R && (R = 5),
                void 0 === A && (A = E.STANDARD_BITRATE),
                void 0 === T && (T = !0),
                void 0 === O && (O = !1),
                void 0 === N && (N = 0),
                (this.dimensions = _),
                (this.frameRate = R),
                (this.bitrate = A),
                (this.captureMouseCursor = T),
                (this.windowFocus = O),
                (this.excludeWindowList = I),
                (this.excludeWindowCount = N);
            };
            var iE;
            (E.VideoCanvas = function (E, A, T, O, I, N) {
              void 0 === A && (A = _.RENDER_MODE_HIDDEN),
                void 0 === O && (O = 0),
                void 0 === N && (N = R.VIDEO_MIRROR_MODE_AUTO),
                (this.view = E),
                (this.renderMode = A),
                (this.channelId = T),
                (this.uid = O),
                (this.priv = I),
                (this.mirrorMode = N);
            }),
              (function (E) {
                (E[(E.LIGHTENING_CONTRAST_LOW = 0)] = 'LIGHTENING_CONTRAST_LOW'),
                  (E[(E.LIGHTENING_CONTRAST_NORMAL = 1)] = 'LIGHTENING_CONTRAST_NORMAL'),
                  (E[(E.LIGHTENING_CONTRAST_HIGH = 2)] = 'LIGHTENING_CONTRAST_HIGH');
              })((iE = E.LIGHTENING_CONTRAST_LEVEL || (E.LIGHTENING_CONTRAST_LEVEL = {})));
            var oE, VE;
            (E.BeautyOptions = function (E, _, R, A) {
              void 0 === E && (E = iE.LIGHTENING_CONTRAST_NORMAL),
                void 0 === _ && (_ = 0),
                void 0 === R && (R = 0),
                void 0 === A && (A = 0),
                (this.lighteningContrastLevel = E),
                (this.lighteningLevel = _),
                (this.smoothnessLevel = R),
                (this.rednessLevel = A);
            }),
              (function (E) {
                (E[(E.AREA_CODE_CN = 1)] = 'AREA_CODE_CN'),
                  (E[(E.AREA_CODE_NA = 2)] = 'AREA_CODE_NA'),
                  (E[(E.AREA_CODE_EU = 4)] = 'AREA_CODE_EU'),
                  (E[(E.AREA_CODE_AS = 8)] = 'AREA_CODE_AS'),
                  (E[(E.AREA_CODE_JP = 16)] = 'AREA_CODE_JP'),
                  (E[(E.AREA_CODE_IN = 32)] = 'AREA_CODE_IN'),
                  (E[(E.AREA_CODE_GLOB = 4294967295)] = 'AREA_CODE_GLOB');
              })((oE = E.AREA_CODE || (E.AREA_CODE = {}))),
              ((VE = E.ENCRYPTION_CONFIG || (E.ENCRYPTION_CONFIG = {}))[
                (VE.ENCRYPTION_FORCE_SETTING = 1)
              ] = 'ENCRYPTION_FORCE_SETTING'),
              (VE[(VE.ENCRYPTION_FORCE_DISABLE_PACKET = 2)] = 'ENCRYPTION_FORCE_DISABLE_PACKET');
            var aE;
            (E.RtcEngineContext = function (E) {
              (this.areaCode = oE.AREA_CODE_GLOB), (this.appId = E);
            }),
              ((aE = E.METADATA_TYPE || (E.METADATA_TYPE = {}))[(aE.UNKNOWN_METADATA = -1)] =
                'UNKNOWN_METADATA'),
              (aE[(aE.VIDEO_METADATA = 0)] = 'VIDEO_METADATA');
            var uE;
            (E.Metadata = function (E, _, R, A) {
              (this.uid = E), (this.size = _), (this.buffer = R), (this.timeStampMs = A);
            }),
              (function (E) {
                (E[(E.AES_128_XTS = 1)] = 'AES_128_XTS'),
                  (E[(E.AES_128_ECB = 2)] = 'AES_128_ECB'),
                  (E[(E.AES_256_XTS = 3)] = 'AES_256_XTS'),
                  (E[(E.SM4_128_ECB = 4)] = 'SM4_128_ECB'),
                  (E[(E.MODE_END = 5)] = 'MODE_END');
              })((uE = E.ENCRYPTION_MODE || (E.ENCRYPTION_MODE = {})));
            E.EncryptionConfig = function (E, _) {
              void 0 === E && (E = uE.AES_128_XTS),
                (this.encryptionMode = E),
                (this.encryptionKey = _);
            };
          })(N || (N = {})),
          (function (E) {
            (E.initialize = function (E) {
              return S(T.INITIALIZE, E);
            }),
              (E.release = function () {
                S(T.RELEASE);
              }),
              (E.on = function (E, _) {
                return window.agoraBridge.on('on' + E, _);
              }),
              (E.off = function (E, _) {
                window.agoraBridge.off('on' + E, _);
              }),
              (E.setChannelProfile = function (E) {
                return S(T.SET_CHANNEL_PROFILE, { profile: E });
              }),
              (E.setClientRole = function (E, _) {
                return S(T.SET_CLIENT_ROLE, { role: E, options: _ });
              }),
              (E.joinChannel = function (E, _, R, A) {
                return (
                  void 0 === R && (R = ''),
                  void 0 === A && (A = 0),
                  S(T.JOIN_CHANNEL, { token: E, channelId: _, info: R, uid: A })
                );
              }),
              (E.switchChannel = function (E, _) {
                return S(T.SWITCH_CHANNEL, { token: E, channelId: _ });
              }),
              (E.leaveChannel = function () {
                return S(T.LEAVE_CHANNEL);
              }),
              (E.renewToken = function (E) {
                return S(T.RE_NEW_TOKEN, { token: E });
              }),
              (E.registerLocalUserAccount = function (E, _) {
                return S(T.REGISTER_LOCAL_USER_ACCOUNT, { appId: E, userAccount: _ });
              }),
              (E.joinChannelWithUserAccount = function (E, _, R) {
                return S(T.JOIN_CHANNEL_WITH_USER_ACCOUNT, {
                  token: E,
                  channelId: _,
                  userAccount: R,
                });
              }),
              (E.getUserInfoByUserAccount = function (E) {
                return S(T.GET_USER_INFO_BY_USER_ACCOUNT, { userAccount: E });
              }),
              (E.getUserInfoByUid = function (E) {
                return S(T.GET_USER_INFO_BY_UID, { uid: E });
              }),
              (E.startEchoTest = function (E) {
                return void 0 === E
                  ? S(T.START_ECHO_TEST)
                  : S(T.START_ECHO_TEST_2, { intervalInSeconds: E });
              }),
              (E.stopEchoTest = function () {
                return S(T.STOP_ECHO_TEST);
              }),
              (E.enableVideo = function () {
                return S(T.ENABLE_VIDEO);
              }),
              (E.disableVideo = function () {
                return S(T.DISABLE_VIDEO);
              }),
              (E.setVideoProfile = function (E, _) {
                return S(T.SET_VIDEO_PROFILE, { profile: E, swapWidthAndHeight: _ });
              }),
              (E.setVideoEncoderConfiguration = function (E) {
                return S(T.SET_VIDEO_ENCODER_CONFIGURATION, { config: E });
              }),
              (E.setCameraCapturerConfiguration = function (E) {
                return S(T.SET_CAMERA_CAPTURER_CONFIGURATION, { config: E });
              }),
              (E.setupLocalVideo = function (E) {
                if (E) {
                  window.agoraBridge.cacheVideoFrame(0);
                  var R = _.attach(E);
                  requestAnimationFrame(function _() {
                    if (E.isConnected) {
                      var A = window.bufferMap[0];
                      if (A) {
                        var T = D.format({
                            width: A.width,
                            height: A.height,
                            chromaWidth: A.width / 2,
                            chromaHeight: A.height / 2,
                            cropLeft: A.yStride - A.width,
                          }),
                          O = D.frame(
                            T,
                            { bytes: new Uint8Array(new Uint8Array(A.yBuffer)), stride: A.yStride },
                            { bytes: new Uint8Array(new Uint8Array(A.uBuffer)), stride: A.uStride },
                            { bytes: new Uint8Array(new Uint8Array(A.vBuffer)), stride: A.vStride },
                          );
                        R.drawFrame(O), requestAnimationFrame(_);
                      } else requestAnimationFrame(_);
                    }
                  });
                } else window.agoraBridge.clearVideoFrame(0);
              }),
              (E.setupRemoteVideo = function (E, R) {
                if (E) {
                  window.agoraBridge.cacheVideoFrame(R);
                  var A = _.attach(E);
                  requestAnimationFrame(function _() {
                    if (E.isConnected) {
                      var T = window.bufferMap[R];
                      if (T) {
                        var O = D.format({
                            width: T.width,
                            height: T.height,
                            chromaWidth: T.width / 2,
                            chromaHeight: T.height / 2,
                            cropLeft: T.yStride - T.width,
                          }),
                          I = D.frame(
                            O,
                            { bytes: new Uint8Array(new Uint8Array(T.yBuffer)), stride: T.yStride },
                            { bytes: new Uint8Array(new Uint8Array(T.uBuffer)), stride: T.uStride },
                            { bytes: new Uint8Array(new Uint8Array(T.vBuffer)), stride: T.vStride },
                          );
                        A.drawFrame(I), requestAnimationFrame(_);
                      } else requestAnimationFrame(_);
                    }
                  });
                } else window.agoraBridge.clearVideoFrame(R);
              }),
              (E.startPreview = function () {
                return S(T.START_PREVIEW);
              }),
              (E.setRemoteUserPriority = function (E, _) {
                return S(T.SET_REMOTE_USER_PRIORITY, { uid: E, userPriority: _ });
              }),
              (E.stopPreview = function () {
                return S(T.STOP_PREVIEW);
              }),
              (E.enableAudio = function () {
                return S(T.ENABLE_AUDIO);
              }),
              (E.enableLocalAudio = function (E) {
                return S(T.ENABLE_LOCAL_AUDIO, { enabled: E });
              }),
              (E.disableAudio = function () {
                return S(T.DISABLE_AUDIO);
              }),
              (E.setAudioProfile = function (E, _) {
                return S(T.SET_AUDIO_PROFILE, { profile: E, scenario: _ });
              }),
              (E.muteLocalAudioStream = function (E) {
                return S(T.MUTE_LOCAL_AUDIO_STREAM, { mute: E });
              }),
              (E.muteAllRemoteAudioStreams = function (E) {
                return S(T.MUTE_ALL_REMOTE_AUDIO_STREAMS, { mute: E });
              }),
              (E.setDefaultMuteAllRemoteAudioStreams = function (E) {
                return S(T.SET_DEFAULT_MUTE_ALL_REMOTE_AUDIO_STREAMS, { mute: E });
              }),
              (E.adjustUserPlaybackSignalVolume = function (E, _) {
                return S(T.ADJUST_USER_PLAYBACK_SIGNAL_VOLUME, { uid: E, volume: _ });
              }),
              (E.muteRemoteAudioStream = function (E, _) {
                return S(T.MUTE_REMOTE_AUDIO_STREAM, { userId: E, mute: _ });
              }),
              (E.muteLocalVideoStream = function (E) {
                return S(T.MUTE_LOCAL_VIDEO_STREAM, { mute: E });
              }),
              (E.enableLocalVideo = function (E) {
                return S(T.ENABLE_LOCAL_VIDEO, { enabled: E });
              }),
              (E.muteAllRemoteVideoStreams = function (E) {
                return S(T.MUTE_ALL_REMOTE_VIDEO_STREAMS, { mute: E });
              }),
              (E.setDefaultMuteAllRemoteVideoStreams = function (E) {
                return S(T.SET_DEFAULT_MUTE_ALL_REMOTE_VIDEO_STREAMS, { mute: E });
              }),
              (E.muteRemoteVideoStream = function (E, _) {
                return S(T.MUTE_REMOTE_VIDEO_STREAM, { userId: E, mute: _ });
              }),
              (E.setRemoteVideoStreamType = function (E, _) {
                return S(T.SET_REMOTE_VIDEO_STREAM_TYPE, { userId: E, streamType: _ });
              }),
              (E.setRemoteDefaultVideoStreamType = function (E) {
                return S(T.SET_REMOTE_DEFAULT_VIDEO_STREAM_TYPE, { streamType: E });
              }),
              (E.enableAudioVolumeIndication = function (E, _, R) {
                return S(T.ENABLE_AUDIO_VOLUME_INDICATION, {
                  interval: E,
                  smooth: _,
                  report_vad: R,
                });
              }),
              (E.startAudioRecording = function (E, _, R) {
                return void 0 === R
                  ? S(T.START_AUDIO_RECORDING, { filePath: E, quality: _ })
                  : S(T.START_AUDIO_RECORDING2, { filePath: E, sampleRate: R, quality: _ });
              }),
              (E.stopAudioRecording = function () {
                return S(T.STOP_AUDIO_RECORDING);
              }),
              (E.startAudioMixing = function (E, _, R, A) {
                return L(O.START_AUDIO_MIXING, { filePath: E, loopback: _, replace: R, cycle: A });
              }),
              (E.stopAudioMixing = function () {
                return L(O.STOP_AUDIO_MIXING);
              }),
              (E.pauseAudioMixing = function () {
                return L(O.PAUSE_AUDIO_MIXING);
              }),
              (E.resumeAudioMixing = function () {
                return L(O.RESUME_AUDIO_MIXING);
              }),
              (E.setHighQualityAudioParameters = function (E, _, R) {
                return L(O.SET_HIGH_QUALITY_AUDIO_PARAMETERS, {
                  fullband: E,
                  stereo: _,
                  fullBitrate: R,
                });
              }),
              (E.adjustAudioMixingVolume = function (E) {
                return L(O.ADJUST_AUDIO_MIXING_VOLUME, { volume: E });
              }),
              (E.adjustAudioMixingPlayoutVolume = function (E) {
                return L(O.ADJUST_AUDIO_MIXING_PLAYOUT_VOLUME, { volume: E });
              }),
              (E.getAudioMixingPlayoutVolume = function () {
                return L(O.GET_AUDIO_MIXING_PLAYOUT_VOLUME);
              }),
              (E.adjustAudioMixingPublishVolume = function (E) {
                return L(O.ADJUST_AUDIO_MIXING_PUBLISH_VOLUME, { volume: E });
              }),
              (E.getAudioMixingPublishVolume = function () {
                return L(O.GET_AUDIO_MIXING_PUBLISH_VOLUME);
              }),
              (E.getAudioMixingDuration = function () {
                return L(O.GET_AUDIO_MIXING_DURATION);
              }),
              (E.getAudioMixingCurrentPosition = function () {
                return L(O.GET_AUDIO_MIXING_CURRENT_POSITION);
              }),
              (E.setAudioMixingPosition = function (E) {
                return L(O.SET_AUDIO_MIXING_POSITION, { pos: E });
              }),
              (E.setAudioMixingPitch = function (E) {
                return L(O.SET_AUDIO_MIXING_PITCH, { pitch: E });
              }),
              (E.getEffectsVolume = function () {
                return L(O.GET_EFFECTS_VOLUME);
              }),
              (E.setEffectsVolume = function (E) {
                return L(O.SET_EFFECTS_VOLUME, { volume: E });
              }),
              (E.setVolumeOfEffect = function (E, _) {
                return L(O.SET_VOLUME_OF_EFFECT, { soundId: E, volume: _ });
              }),
              (E.enableFaceDetection = function (E) {
                return S(T.ENABLE_FACE_DETECTION, { enabled: E });
              }),
              (E.playEffect = function (E, _, R, A, T, I, N) {
                return L(O.PLAY_EFFECT, {
                  soundId: E,
                  filePath: _,
                  loopCount: R,
                  pitch: A,
                  pan: T,
                  gain: I,
                  publish: N,
                });
              }),
              (E.stopEffect = function (E) {
                return L(O.STOP_EFFECT, { soundId: E });
              }),
              (E.stopAllEffects = function () {
                return L(O.STOP_ALL_EFFECTS);
              }),
              (E.preloadEffect = function (E, _) {
                return L(O.PRE_LOAD_EFFECT, { soundId: E, filePath: _ });
              }),
              (E.unloadEffect = function (E) {
                return L(O.UN_LOAD_EFFECT, { soundId: E });
              }),
              (E.pauseEffect = function (E) {
                return L(O.PAUSE_EFFECT, { soundId: E });
              }),
              (E.pauseAllEffects = function () {
                return L(O.PAUSE_ALL_EFFECTS);
              }),
              (E.resumeEffect = function (E) {
                return L(O.RESUME_EFFECT, { soundId: E });
              }),
              (E.resumeAllEffects = function () {
                return L(O.RESUME_ALL_EFFECTS);
              }),
              (E.enableSoundPositionIndication = function (E) {
                return L(O.ENABLE_SOUND_POSITION_INDICATION, { enabled: E });
              }),
              (E.setRemoteVoicePosition = function (E, _, R) {
                return S(T.SET_REMOTE_VOICE_POSITIONN, { uid: E, pan: _, gain: R });
              }),
              (E.setLocalVoicePitch = function (E) {
                return L(O.SET_LOCAL_VOICE_CHANGER, { pitch: E });
              }),
              (E.setLocalVoiceEqualization = function (E, _) {
                return L(O.SET_LOCAL_VOICE_EQUALIZATION, { bandFrequency: E, bandGain: _ });
              }),
              (E.setLocalVoiceReverb = function (E, _) {
                return L(O.SET_LOCAL_VOICE_REVERB, { reverbKey: E, value: _ });
              }),
              (E.setLocalVoiceChanger = function (E) {
                return L(O.SET_LOCAL_VOICE_CHANGER, { voiceChanger: E });
              }),
              (E.setLocalVoiceReverbPreset = function (E) {
                return L(O.SET_LOCAL_VOICE_REVERB_PRESET, { reverbPreset: E });
              }),
              (E.setVoiceBeautifierPreset = function (E) {
                return L(O.SET_VOICE_BEAUTIFIER_PRESET, { preset: E });
              }),
              (E.setAudioEffectPreset = function (E) {
                return L(O.SET_AUDIO_EFFECT_PRESET, { preset: E });
              }),
              (E.setAudioEffectParameters = function (E, _, R) {
                return L(O.SET_AUDIO_EFFECT_PARAMETERS, { preset: E, param1: _, param2: R });
              }),
              (E.setLogFile = function (E) {
                return S(T.SET_LOG_FILE, { filePath: E });
              }),
              (E.setLogFilter = function (E) {
                return S(T.SET_LOG_FILTER, { filter: E });
              }),
              (E.setLogFileSize = function (E) {
                return S(T.SET_LOG_FILE_SIZE, { fileSizeInKBytes: E });
              }),
              (E.setLocalRenderMode = function (E, _) {
                return void 0 === _
                  ? S(T.SET_LOCAL_RENDER_MODE, { renderMode: E })
                  : S(T.SET_LOCAL_RENDER_MODE_2, { renderMode: E, mirrorMode: _ });
              }),
              (E.setRemoteRenderMode = function (E, _, R) {
                return void 0 === R
                  ? S(T.SET_REMOTE_RENDER_MODE, { userId: E, renderMode: _ })
                  : S(T.SET_REMOTE_RENDER_MODE_2, { userId: E, renderMode: _, mirrorMode: R });
              }),
              (E.setLocalVideoMirrorMode = function (E) {
                return S(T.SET_LOCAL_VIDEO_MIRROR_MODE, { mirrorMode: E });
              }),
              (E.enableDualStreamMode = function (E) {
                return S(T.ENABLE_DUAL_STREAM_MODE, { enabled: E });
              }),
              (E.setExternalAudioSource = function (E, _, R) {
                return L(O.SET_EXTERNAL_AUDIO_SOURCE, { enabled: E, sampleRate: _, channels: R });
              }),
              (E.setExternalAudioSink = function (E, _, R) {
                return L(O.SET_EXTERNAL_AUDIO_SINK, { enabled: E, sampleRate: _, channels: R });
              }),
              (E.setRecordingAudioFrameParameters = function (E, _, R, A) {
                return L(O.SET_RECORDING_AUDIO_FRAME_PARAMETERS, {
                  sampleRate: E,
                  channel: _,
                  mode: R,
                  samplesPerCall: A,
                });
              }),
              (E.setPlaybackAudioFrameParameters = function (E, _, R, A) {
                return L(O.SET_PLAYBACK_AUDIO_FRAME_PARAMETERS, {
                  sampleRate: E,
                  channel: _,
                  mode: R,
                  samplesPerCall: A,
                });
              }),
              (E.setMixedAudioFrameParameters = function (E, _) {
                return L(O.SET_MIXED_AUDIO_FRAME_PARAMETERS, { sampleRate: E, samplesPerCall: _ });
              }),
              (E.adjustRecordingSignalVolume = function (E) {
                return S(T.ADJUST_RECORDING_SIGNAL_VOLUME, { volume: E });
              }),
              (E.adjustPlaybackSignalVolume = function (E) {
                return S(T.ADJUST_PLAYBACK_SIGNAL_VOLUME, { volume: E });
              }),
              (E.enableWebSdkInteroperability = function (E) {
                return S(T.ENABLE_WEB_SDK_INTEROPER_ABILITY, { enabled: E });
              }),
              (E.setVideoQualityParameters = function (E) {
                return S(T.SET_VIDEO_QUALITY_PARAMETERS, { preferFrameRateOverImageQuality: E });
              }),
              (E.setLocalPublishFallbackOption = function (E) {
                return S(T.SET_LOCAL_PUBLISH_FALLBACK_OPTION, { option: E });
              }),
              (E.setRemoteSubscribeFallbackOption = function (E) {
                return S(T.SET_REMOTE_SUBSCRIBE_FALLBACK_OPTION, { option: E });
              }),
              (E.switchCamera = function (E) {
                return void 0 === E ? S(T.SWITCH_CAMERA) : S(T.SWITCH_CAMERA_2, { direction: E });
              }),
              (E.setDefaultAudioRouteToSpeakerphone = function (E) {
                return S(T.SET_DEFAULT_AUDIO_ROUTE_SPEAKER_PHONE, { defaultToSpeaker: E });
              }),
              (E.setEnableSpeakerphone = function (E) {
                return S(T.SET_ENABLE_SPEAKER_PHONE, { speakerOn: E });
              }),
              (E.enableInEarMonitoring = function (E) {
                return S(T.ENABLE_IN_EAR_MONITORING, { enabled: E });
              }),
              (E.setInEarMonitoringVolume = function (E) {
                return S(T.SET_IN_EAR_MONITORING_VOLUME, { volume: E });
              }),
              (E.isSpeakerphoneEnabled = function () {
                return S(T.IS_SPEAKER_PHONE_ENABLED);
              }),
              (E.setAudioSessionOperationRestriction = function (E) {
                return S(T.SET_AUDIO_SESSION_OPERATION_RESTRICTION, { restriction: E });
              }),
              (E.enableLoopbackRecording = function (E, _) {
                return S(T.ENABLE_LOOP_BACK_RECORDING, { enabled: E, deviceName: _ });
              }),
              (E.startScreenCaptureByDisplayId = function (E, _, R) {
                return S(T.START_SCREEN_CAPTURE_BY_DISPLAY_ID, {
                  displayId: E,
                  regionRect: _,
                  captureParams: R,
                });
              }),
              (E.startScreenCaptureByScreenRect = function (E, _, R) {
                return S(T.START_SCREEN_CAPTURE_BY_SCREEN_RECT, {
                  screenRect: E,
                  regionRect: _,
                  captureParams: R,
                });
              }),
              (E.startScreenCaptureByWindowId = function (E, _, R) {
                return S(T.START_SCREEN_CAPTURE_BY_WINDOW_ID, {
                  windowId: E,
                  regionRect: _,
                  captureParams: R,
                });
              }),
              (E.setScreenCaptureContentHint = function (E) {
                return S(T.SET_SCREEN_CAPTURE_CONTENT_HINT, { contentHint: E });
              }),
              (E.updateScreenCaptureParameters = function (E) {
                return S(T.UPDATE_SCREEN_CAPTURE_PARAMETERS, { captureParams: E });
              }),
              (E.updateScreenCaptureRegion = function (E) {
                return S(T.UPDATE_SCREEN_CAPTURE_REGION, { regionRect: E });
              }),
              (E.stopScreenCapture = function () {
                return S(T.STOP_SCREEN_CAPTURE);
              }),
              (E.getCallId = function () {
                return S(T.GET_CALL_ID);
              }),
              (E.rate = function (E, _, R) {
                return S(T.RATE, { callId: E, rating: _, description: R });
              }),
              (E.complain = function (E, _) {
                return S(T.COMPLAIN, { callId: E, description: _ });
              }),
              (E.getVersion = function () {
                return S(T.GET_VERSION);
              }),
              (E.enableLastmileTest = function () {
                return S(T.ENABLE_LAST_MILE_TEST);
              }),
              (E.disableLastmileTest = function () {
                return S(T.DISABLE_LAST_MILE_TEST);
              }),
              (E.startLastmileProbeTest = function (E) {
                return S(T.START_LAST_MILE_PROBE_TEST, { config: E });
              }),
              (E.stopLastmileProbeTest = function () {
                return S(T.STOP_LAST_MILE_PROBE_TEST);
              }),
              (E.getErrorDescription = function (E) {
                return S(T.GET_ERROR_DESCRIPTION, { code: E });
              }),
              (E.setEncryptionSecret = function (E) {
                return S(T.SET_ENCRYPTION_SECTRT, { secret: E });
              }),
              (E.setEncryptionMode = function (E) {
                return S(T.SET_ENCRYPTION_MODE, { encryptionMode: E });
              }),
              (E.enableEncryption = function (E, _) {
                return S(T.ENABLE_ENCRYPTION, { enabled: E, config: _ });
              }),
              (E.registerPacketObserver = function (E) {
                return S(T.REGISTER_PACKET_OBSERVER, { observer: E });
              }),
              (E.createDataStream = function (E, _, R) {
                return S(T.CREATE_DATA_STREAM, { streamId: E, reliable: _, ordered: R });
              }),
              (E.sendStreamMessage = function (E, _, R) {
                return S(T.SEND_STREAM_MESSAGE, { streamId: E, length: R }, _);
              }),
              (E.addPublishStreamUrl = function (E, _) {
                return S(T.ADD_PUBLISH_STREAM_URL, { url: E, transcodingEnabled: _ });
              }),
              (E.removePublishStreamUrl = function (E) {
                return S(T.REMOVE_PUBLISH_STREAM_URL, { url: E });
              }),
              (E.setLiveTranscoding = function (E) {
                return S(T.SET_LIVE_TRANSCODING, { transcoding: E });
              }),
              (E.addVideoWatermark = function (E, _) {
                return S(T.ADD_VIDEO_WATER_MARK_2, { watermarkUrl: E, options: _ });
              }),
              (E.clearVideoWatermarks = function () {
                return S(T.CLEAR_VIDEO_WATER_MARKS);
              }),
              (E.setBeautyEffectOptions = function (E, _) {
                return S(T.SET_BEAUTY_EFFECT_OPTIONS, { enabled: E, options: _ });
              }),
              (E.addInjectStreamUrl = function (E, _) {
                return S(T.ADD_INJECT_STREAM_URL, { url: E, config: _ });
              }),
              (E.startChannelMediaRelay = function (E) {
                return S(T.START_CHANNEL_MEDIA_RELAY, { configuration: E });
              }),
              (E.updateChannelMediaRelay = function (E) {
                return S(T.UPDATE_CHANNEL_MEDIA_RELAY, { configuration: E });
              }),
              (E.stopChannelMediaRelay = function () {
                return S(T.STOP_CHANNEL_MEDIA_RELAY);
              }),
              (E.removeInjectStreamUrl = function (E) {
                return S(T.REMOVE_INJECT_STREAM_URL, { url: E });
              }),
              (E.sendCustomReportMessage = function (E, _, R, A, O) {
                return S(T.SEND_CUSTOM_REPORT_MESSAGE, {
                  id: E,
                  category: _,
                  event: R,
                  label: A,
                  value: O,
                });
              }),
              (E.getConnectionState = function () {
                return S(T.GET_CONNECTION_STATE);
              }),
              (E.enableRemoteSuperResolution = function (E, _) {
                return S(T.ENABLE_REMOTE_SUPER_RESOLUTION, { userId: E, enable: _ });
              }),
              (E.sendMetadata = function (E) {
                var _ = E.uid,
                  R = E.size,
                  A = E.buffer,
                  O = E.timeStampMs;
                return S(T.SEND_METADATA, { uid: _, size: R, timeStampMs: O }, A);
              }),
              (E.setMaxMetadataSize = function (E) {
                return S(T.SET_MAX_META_SIZE, { size: E });
              }),
              (E.registerMediaMetadataObserver = function (E) {
                return S(T.REGISTER_MEDIA_META_DATA_OBSERVER, { type: E });
              }),
              (E.setParameters = function (E) {
                return S(T.SET_PARAMETERS, { parameters: E });
              });
          })(N || (N = {})),
          (function (_) {
            (_.audioDeviceManager = {
              enumeratePlaybackDevices: function () {
                var _ = e(I.GET_COUNT);
                return _ < 0
                  ? []
                  : E([], Array(_)).map(function (E, _) {
                      return e(I.GET_DEVICE, { index: _ });
                    });
              },
              enumerateRecordingDevices: function () {
                var _ = C(I.GET_COUNT);
                return _ < 0
                  ? []
                  : E([], Array(_)).map(function (E, _) {
                      return C(I.GET_DEVICE, { index: _ });
                    });
              },
              getPlaybackDevice: function () {
                return e(I.GET_CURRENT_DEVICE);
              },
              getPlaybackDeviceInfo: function () {
                return e(I.GET_CURRENT_DEVICE_INFO);
              },
              getPlaybackDeviceMute: function () {
                return e(I.GET_DEVICE_MUTE);
              },
              getPlaybackDeviceVolume: function () {
                return e(I.GET_DEVICE_VOLUME);
              },
              getRecordingDevice: function () {
                return C(I.GET_CURRENT_DEVICE);
              },
              getRecordingDeviceInfo: function () {
                return C(I.GET_CURRENT_DEVICE_INFO);
              },
              getRecordingDeviceMute: function () {
                return C(I.GET_DEVICE_MUTE);
              },
              getRecordingDeviceVolume: function () {
                return C(I.GET_DEVICE_VOLUME);
              },
              release: function () {},
              setPlaybackDevice: function (E) {
                return e(I.SET_DEVICE, { deviceId: E });
              },
              setPlaybackDeviceMute: function (E) {
                return e(I.SET_DEVICE_MUTE, { mute: E });
              },
              setPlaybackDeviceVolume: function (E) {
                return e(I.SET_DEVICE_VOLUME, { volume: E });
              },
              setRecordingDevice: function (E) {
                return C(I.SET_DEVICE, { deviceId: E });
              },
              setRecordingDeviceMute: function (E) {
                return C(I.SET_DEVICE_MUTE, { mute: E });
              },
              setRecordingDeviceVolume: function (E) {
                return C(I.SET_DEVICE_VOLUME, { volume: E });
              },
              startAudioDeviceLoopbackTest: function (E) {
                return e(I.START_AUDIO_DEVICE_LOOP_BACK_TEST, { indicationInterval: E });
              },
              startPlaybackDeviceTest: function (E) {
                return e(I.START_DEVICE_TEST, { testAudioFilePath: E });
              },
              startRecordingDeviceTest: function (E) {
                return C(I.START_DEVICE_TEST, { indicationInterval: E });
              },
              stopAudioDeviceLoopbackTest: function () {
                return e(I.STOP_AUDIO_DEVICE_LOOP_BACK_TEST);
              },
              stopPlaybackDeviceTest: function () {
                return e(I.STOP_DEVICE_TEST);
              },
              stopRecordingDeviceTest: function () {
                return C(I.STOP_DEVICE_TEST);
              },
            }),
              (_.videoDeviceManager = {
                enumerateVideoDevices: function () {
                  var _ = t(I.GET_COUNT);
                  return _ < 0
                    ? []
                    : E([], Array(_)).map(function (E, _) {
                        return t(I.GET_DEVICE, { index: _ });
                      });
                },
                getDevice: function () {
                  return t(I.GET_CURRENT_DEVICE);
                },
                release: function () {},
                setDevice: function (E) {
                  return t(I.SET_DEVICE, { deviceId: E });
                },
                startDeviceTest: function (E) {
                  return t(I.START_DEVICE_TEST, { hwnd: E });
                },
                stopDeviceTest: function () {
                  return t(I.STOP_DEVICE_TEST);
                },
              });
          })(N || (N = {}));
      })(),
      A
    );
  })();
});
