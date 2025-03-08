const cv = require('opencv4nodejs');
const path = require('path');

exports.detectManipulation = (req, res) => {
  try {
    const imagePath = path.join(__dirname, '..', req.file.path);  // Get the image path

    // Read the image using OpenCV
    const img = cv.imread(imagePath);

    // Example manipulation detection logic using edge detection
    const edges = img.canny(100, 200);  // You can enhance this logic based on your needs

    // Simulating manipulation detection (to be enhanced)
    const manipulationDetected = edges.rows > 0 && edges.cols > 0;

    res.json({
      manipulationDetected,
      message: manipulationDetected ? 'Manipulation detected' : 'No manipulation detected',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error detecting manipulation' });
  }
};
