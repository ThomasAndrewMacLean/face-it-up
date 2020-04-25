import { UPLOAD_URL } from '../constants';

export const add = (a, b) => {
  return a + b;
};

const isProduction = process.env.NODE_ENV === 'production';
export const prefix = isProduction ? '/mask-it-up' : '';

export const getImageUrl = (context, id, full) => {
  return full
    ? context.find((p) => p.id === id).pic[0].url
    : context.find((p) => p.id === id).pic[0].thumbnails.large.url;
};
// from http://stackoverflow.com/a/32490603
export function getOrientation(file, callback) {
  var reader = new FileReader();

  reader.onload = function (event) {
    var view = new DataView(event.target.result);

    if (view.getUint16(0, false) != 0xffd8) return callback(-2);

    var length = view.byteLength,
      offset = 2;

    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;

      if (marker == 0xffe1) {
        if (view.getUint32((offset += 2), false) != 0x45786966) {
          return callback(-1);
        }
        var little = view.getUint16((offset += 6), false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;

        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + i * 12, little) == 0x0112)
            return callback(view.getUint16(offset + i * 12 + 8, little));
      } else if ((marker & 0xff00) != 0xff00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}

export const picFile = () => {
  const fileInput = document.getElementById('fileinput');
  const file = fileInput.files[0];
  if (!file) return;

  getOrientation(file, (orientation) => {
    const canvas = document.getElementById('canvas');

    canvas.height = 250;
    canvas.width = 250;
    const ctx = canvas.getContext('2d');

    var img = new Image();
    if (file.type.match('image.*')) {
      img.onload = function () {
        var hRatio = canvas.width / img.width;
        var vRatio = canvas.height / img.height;
        // set to max so we can have a square pic
        var ratio = Math.max(hRatio, vRatio);
        canvas.height = img.height * ratio;
        canvas.width = img.width * ratio;

        var width = canvas.width;
        var styleWidth = canvas.style.width;
        var height = canvas.height;
        var styleHeight = canvas.style.height;

        if (orientation > 4) {
          canvas.width = height;
          canvas.style.width = styleHeight;
          canvas.height = width;
          canvas.style.height = styleWidth;
        }

        // set canvas to be square
        var smallest = Math.min(canvas.width, canvas.height);
        width = smallest;
        height = smallest;
        canvas.width = smallest;
        canvas.style.width = smallest;
        canvas.height = smallest;
        canvas.style.height = smallest;

        console.log('orientation: ', orientation);

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          img.width * ratio,
          img.height * ratio
        );

        canvas.toBlob(function (blob) {
          var reader = new FileReader();

          reader.onload = function () {
            fetch(UPLOAD_URL, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ filee: reader.result }),
            })
              .then((response) => response.json())
              .then((response) => {
                fileInput.value = '';
                console.log(JSON.parse(response.body));
                // check for error
                JSON.parse(response.body).FaceDetails.forEach((face) => {
                  const top =
                    (face.Landmarks.find((x) => x.Type === 'eyeLeft').Y +
                      face.Landmarks.find((x) => x.Type === 'eyeLeft').Y +
                      face.Landmarks.find((x) => x.Type === 'nose').Y) /
                    3;
                  const left = face.BoundingBox.Left;
                  const right = face.BoundingBox.Left + face.BoundingBox.Width;
                  const bottom = face.BoundingBox.Top + face.BoundingBox.Height;

                  var img = new Image();
                  img.onload = function () {
                    ctx.drawImage(
                      img,
                      canvas.width * left,
                      canvas.height * top,
                      canvas.width * right - canvas.width * left,
                      canvas.width * bottom - canvas.width * top
                    );
                  };
                  img.src = './mask.png';
                });
              });
          };
          reader.onerror = function (error) {
            console.log('Error: ', error);
          };

          reader.readAsDataURL(blob);
        });
      };

      img.src = URL.createObjectURL(file);
    }
  });
};
// export const uploadFile = (setLoading) => {
//   setLoading(true);

//   const fileInput = document.getElementById('fileinput');
//   const canvas = document.getElementById('canvas');
//   canvas.height = 250;
//   canvas.width = 250;
//   var ctx = canvas.getContext('2d');
//   ctx.font = '10px Arial';
//   ctx.fillStyle = 'black';

//   var url = URL.createObjectURL(fileInput.files[0]);
//   var img = new Image();
//   img.onload = function () {
//     ctx.drawImage(img, 0, 0);
//   };
//   img.src = url;

//   const file = fileInput.files[0];
//   var reader = new FileReader();
//   reader.readAsDataURL(file);
//   reader.onload = function () {
//     fetch(UPLOAD_URL, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ filee: reader.result }),
//     })
//       .then((response) => response.json())
//       .then((response) => {
//         fileInput.value = '';
//         setLoading(false);
//         console.log(JSON.parse(response.body));
//         // check for error
//         JSON.parse(response.body).FaceDetails.forEach((face) => {
//           const mouthLeft = face.Landmarks.find((x) => x.Type === 'mouthLeft');
//           const mouthRight = face.Landmarks.find(
//             (x) => x.Type === 'mouthRight'
//           );
//           ctx.beginPath();

//           console.log(
//             canvas.width * mouthLeft.X,
//             canvas.height * mouthLeft.Y,
//             canvas.width * mouthRight.X,
//             canvas.height * mouthRight.Y
//           );
//           ctx.rect(
//             canvas.width * mouthLeft.X,
//             canvas.height * mouthLeft.Y,
//             10,
//             10
//           );
//           ctx.stroke();

//           ctx.beginPath();

//           ctx.rect(
//             canvas.width * mouthRight.X,
//             canvas.height * mouthRight.Y,
//             10,
//             10
//           );
//           ctx.stroke();
//         });
//       });
//   };
//   reader.onerror = function (error) {
//     console.log('Error: ', error);
//   };
// };
