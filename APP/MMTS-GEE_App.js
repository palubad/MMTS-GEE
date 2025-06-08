/*
You have accessed the Google Earth Engine tool to generate multi-modal time series 
datasets (MMTS-GEE). 

This tool generates time series with spatially and temporally aligned:
  - Sentinel-1 SAR data, including SAR polarimetric indices, speckle filtering;
  - Sentinel-2 multispectral data (cloud-masked) with vegetation indices;
  - climatic variables from ERA5-Land (temperature and precipitation) and 
  - Copernicus DEM-based topographical features (elevation, slope, aspect, Sentinel-1 Local Incidence Angle, ). 

The MMTS-GEE is designed to efficiently generate comprehensive datasets for multi-modal 
and multi-temporal analyses or various machine learning tasks. Its flexibility allows users 
to customize data generation for specific research goals.

If you use this tool, please cite the following papers:
  Paluba, D., Le Saux, B., Sarti, F., Štych, P. (2024): 
  Identification of Optimal Sentinel-1 SAR Polarimetric Parameters for Forest Monitoring 
  in Czechia. AUC Geographica 59(2), 1–15, DOI: https://doi.org/10.14712/23361980.2024.18

  Paluba, D.; Le Saux, B.; Sarti, F.; Štych, P. (2025): 
  Estimating vegetation indices and biophysical parameters for Central European temperate 
  forests with Sentinel-1 SAR data and machine learning. 
  Big Earth Data.  DOI: 10.1080/20964471.2025.2459300

The full documentation on the use of this can be found on GitHub: 
  github.com/palubad/MMTS-GEE
*/



// ========================================================================================
// ==================== USER INTERFACE: Optical & SAR Indices Selector ====================
// ========================================================================================

var panel = ui.Panel({
  style: {width: '350px'}
});
ui.root.insert(0, panel);


//


// App title
var header = ui.Label('Multi-modal time series generator tool in GEE (MMTS-GEE)', {fontSize: '20px', fontWeight: 'bold', color: '77797e'});

// App summary
var text = ui.Label(
  'Landsat land surface temperature downscaled at 10 m by Sentinel-2 data. ' +
  'Developed for urban management.',
    {fontSize: '15px'});

// App title2
var header2 = ui.Label('How to cite:', {fontSize: '10px', fontWeight: 'bold', margin:'0px 0px -5px 8px'});

// App summary2
var text2 = ui.Label(
  'Paluba, D.; Le Saux, B.; Sarti, F.; Štych, P. (2025): Estimating vegetation indices and biophysical parameters for Central European temperate forests with Sentinel-1 SAR data and machine learning. Big Earth Data.',
    {fontSize: '10px', margin:'5px 0px 0px 8px'});

var textLink = ui.Label(' DOI: 10.1080/20964471.2025.2459300',
  {fontSize: '10px', margin:'0px 0px 0px 8px',color:'blue'})
  .setUrl('https://doi.org/10.1080/20964471.2025.2459300');

// App summary2
var text3 = ui.Label(
  'Paluba, D.; Le Saux, B.; Sarti, F.; Štych, P. (2024): Identification of optimal Sentinel-1 SAR polarimetric parameters for forest monitoring in Czechia. Acta Universitatis Carolinae. Geographica.',
    {fontSize: '10px', margin:'5px 0px 0px 8px'});

var textLink3 = ui.Label(' DOI: 10.14712/23361980.2024.18',
  {fontSize: '10px', margin:'0px 0px 0px 8px',color:'blue'})
  .setUrl('https://karolinum.cz/data/clanek/13382/Geogr_60_1_0046.pdf');
  
// Create a panel to hold text
// var panel = ui.Panel({
//   widgets:[header, text, header2],//Adds header and text
//   style:{width: '500px',position:'middle-right', margin: '10px'}});

var Github1 = ui.Label(
  'Give it a STAR',
    {fontSize: '10px', margin:'5px 0px 0px 8px'});

var Github2 = ui.Label(' on GitHub.',
  {fontSize: '10px', margin:'5px 0px 0px 4px',color:'blue'})
  .setUrl('https://github.com/palubad/MMTS-GEE');
 

panel.add(header);
panel.add(header2);
panel.add(text3);
panel.add(textLink3);
panel.add(text2);
panel.add(textLink);
panel.add((ui.Panel([Github1, Github2],ui.Panel.Layout.flow('horizontal'))))


// Create variable for additional text and separators

// This creates another panel to house a line separator and instructions for the user
var intro = ui.Panel([
  ui.Label({
    value: '_______________________________________________',
    style: {fontWeight: 'bold',  color: '77797e'},
  })]);

// Add panel to the larger panel 
panel.add(intro)

panel.add(ui.Label('1. Set the timeframe', {'fontWeight':'bold'}))
// Status label for feedback
var statusLabel = ui.Label('');
panel.add(statusLabel);



// Date Range
// Date selection widgets
var startLabel = ui.Label({
    value:'Start date',
    style: {margin: '0 55px 0 10px',fontSize: '12px',color: 'gray'}
  })
var endLabel = ui.Label({
    value:'End date',
    style: {margin: '0 0px 0 10px',fontSize: '12px',color: 'gray'}
  })
  
panel.add((ui.Panel([startLabel, endLabel],ui.Panel.Layout.flow('horizontal'))))

var datePanel = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal')
});
var startDateInput = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2021-01-01', style: {width: '100px'}});
var endDateInput = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2022-01-01', style: {width: '100px'}});
datePanel.add(startDateInput);

datePanel.add(endDateInput);
panel.add(datePanel);

// This creates another panel to house a line separator and instructions for the user
var intro2 = ui.Panel([
  ui.Label({
    value: '_______________________________________________',
    style: {fontWeight: 'bold',  color: '77797e'},
  })]);

// Add panel to the larger panel 
panel.add(intro2)

panel.add(ui.Label('2. Set the data for time series generation', {'fontWeight':'bold'}))

// Divider for Random Point Generator
panel.add(ui.Label({value:"Decide whether to generate random points based on a predefined land cover dataset or upload your own data. ", style: {margin: '0 0px 0 10px',fontSize: '12px'}}));
// panel.add(ui.Label({value:"2.1. Set an integer value (10-100) to ESA_LC_type to define for which land cover type do you want to generate your random points. Set 'ALL' if you want to include each land cover type. The ESA World Cover 2021 used here. See the available land cover classes and their integer values: https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v200", style: {margin: '0 0px 0 10px',fontSize: '10px'}}));
// panel.add(ui.Label({value:"2.2. Set how many random points to generate in the numberOfRandomPoints variable.", style: {margin: '0 0px 0 10px',fontSize: '10px'}}));
// panel.add(ui.Label({value:"2.3. Set the buffer around random points (in meters) in the buffer variable. ", style: {margin: '0 0px 0 10px',fontSize: '10px'}}));


// Random Points Checkbox
var genPointsCheckbox = ui.Checkbox('Generate random points', true);
panel.add(genPointsCheckbox);

// Own Data Checkbox
var ownDataCheckbox = ui.Checkbox('I have my own data points/areas uploaded as GEE Asset at:');
panel.add(ownDataCheckbox);

// Textbox for GEE asset path
var assetTextbox = ui.Textbox({
  placeholder: 'users/yourusername/your_asset_path',
  value: '',
  style: {stretch: 'horizontal'}
});
var assetPanel = ui.Panel([assetTextbox], ui.Panel.Layout.flow('vertical'));
assetPanel.style().set('shown', false); // Hidden by default
panel.add(assetPanel);

// --- Random Point Settings Panel ---
var advancedPanel = ui.Panel({layout: ui.Panel.Layout.flow('vertical')});
advancedPanel.style().set('shown', true); // Shown by default

// Dropdown for land cover type
var lcDropdown = ui.Select({
  items: ['ALL', '10 - Tree cover', '20 - Shrubland', '30 - Grassland', '40 - Cropland', '50 - Built-up'],
  value: 'ALL',
  placeholder: 'Land Cover Type'
});

// Number of Points
var numPointsSlider = ui.Slider({min: 400, max: 10000, step: 100, value: 1000});

// Buffer input
var bufferInput = ui.Textbox({value: '20', style: {width: '40px'}});
var bufferRow = ui.Panel([ui.Label('Buffer (m)'), bufferInput], ui.Panel.Layout.flow('horizontal'));

// Vertical panels for layout
var panel1 = ui.Panel([ui.Label('Number of points'), numPointsSlider], ui.Panel.Layout.flow('vertical'));
var panel2 = ui.Panel([ui.Label('ESA Land Cover Type'), lcDropdown], ui.Panel.Layout.flow('vertical'));

advancedPanel.add(ui.Panel([panel1, panel2], ui.Panel.Layout.flow('horizontal')));
advancedPanel.add(bufferRow);

// Country dropdown
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").sort('country_na');
var countryList = countries.aggregate_array('country_na').getInfo();
var countryCodes = countries.aggregate_array('country_co').getInfo();

// Dictionary for dropdown value mapping
var countryDict = {};
for (var i = 0; i < countryList.length; i++) {
  countryDict[countryList[i]] = countryCodes[i];
}

var countrySelector = ui.Select({
  items: Object.keys(countryDict),
  placeholder: 'Select a country',
  value: 'Czechia'
});

var countryPanel = ui.Panel([
  ui.Label('Select a country for random points', {margin: '12px 0px 0px 8px'}),
  countrySelector
], ui.Panel.Layout.flow('horizontal'));


// Country dropdown (already created earlier)
var countrySelectorPanel = ui.Panel([
  ui.Label('Country:', {margin: '8px 0px 0px 8px'}),
  countrySelector
], ui.Panel.Layout.flow('horizontal'));

advancedPanel.add((ui.Panel([ui.Label('Select a country for random points', {margin:'12px 0px 0px 8px'}), countrySelector],ui.Panel.Layout.flow('horizontal'))))

// advancedPanel.add(countryPanel);
panel.add(advancedPanel);


// --- Toggle Logic ---

// Logic for mutually exclusive checkboxes
genPointsCheckbox.onChange(function(checked) {
  if (checked) {
    ownDataCheckbox.setValue(false, false);  // false = no event trigger
    assetPanel.style().set('shown', false);
    advancedPanel.style().set('shown', true);
  } else {
    // Only hide if the other one isn’t enabled
    if (!ownDataCheckbox.getValue()) {
      advancedPanel.style().set('shown', false);
    }
  }
});

ownDataCheckbox.onChange(function(checked) {
  if (checked) {
    genPointsCheckbox.setValue(false, false);
    advancedPanel.style().set('shown', false);
    assetPanel.style().set('shown', true);
  } else {
    assetPanel.style().set('shown', false);
    if (!genPointsCheckbox.getValue()) {
      // If both are off, hide both UI panels
      advancedPanel.style().set('shown', false);
    }
  }
});

// This creates another panel to house a line separator and instructions for the user
var intro3 = ui.Panel([
  ui.Label({
    value: '_______________________________________________',
    style: {fontWeight: 'bold',  color: '77797e'},
  })]);

// Add panel to the larger panel 
panel.add(intro3)

panel.add(ui.Label('3. Set the preprocessing for optical and SAR data', {'fontWeight':'bold'}))

// Cloud threshold
var cloudSlider = ui.Slider({min: 0, max: 100, step: 1, value: 30});
panel.add(ui.Label('Sentinel-2 data preprocessing', {fontWeight: 'bold'}));
panel.add((ui.Panel([ui.Label('Max cloud cover (%)'), cloudSlider],ui.Panel.Layout.flow('horizontal'))))

var thresholdSlider = ui.Slider({min: 0, max: 1, step: 0.01, value: 0.6});
panel.add((ui.Panel([ui.Label("CloudScore+ 'cs' threshold"), thresholdSlider],ui.Panel.Layout.flow('horizontal'))))

// Optical & SAR Indices Checkboxes
var opticalOptions = ['NDVI', 'FAPAR', 'LAI', 'EVI'];
var sarOptions = ['VV', 'VH', 'RVI', 'RFDI', 'NRPB', 'VH/VV', 'VV/VH', 'DPSVIm'];
var opticalCheckboxes = [];
var sarCheckboxes = [];

function createCheckboxGrid(options, checkboxesList, columns) {
  var rows = [];
  for (var i = 0; i < options.length; i += columns) {
    var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal')});
    for (var j = 0; j < columns; j++) {
      var index = i + j;
      if (index < options.length) {
        var checkbox = ui.Checkbox(options[index], true);
        checkboxesList.push(checkbox);
        row.add(checkbox);
      }
    }
    rows.push(row);
  }
  return rows;
}

// Add Optical Indices checkboxes (4 columns)
panel.add(ui.Label('Optical vegetation indices and biophysical parameters'));
createCheckboxGrid(opticalOptions, opticalCheckboxes, 4).forEach(function(row) {
  panel.add(row);
});

// This creates another panel to house a line separator and instructions for the user
var intro4 = ui.Panel([
  ui.Label({
    value: '_______________________________________________',
    style: {fontWeight: 'bold',  color: '77797e'},
  })]);

// Add panel to the larger panel 
panel.add(intro4)

panel.add(ui.Label('Sentinel-1 data preprocessing', {fontWeight: 'bold'}));

var CheckboxSpeckle = ui.Checkbox('Lee speckle filter', true);
var speckleKernelInput = ui.Textbox({value: 5,style: {width: '30px'}});

panel.add((ui.Panel([CheckboxSpeckle, ui.Label('Kernel window size:'), speckleKernelInput], ui.Panel.Layout.flow('horizontal'))))

// Add SAR Indices checkboxes (4 columns)
panel.add(ui.Label('SAR polarimetric parameters'));
createCheckboxGrid(sarOptions, sarCheckboxes, 4).forEach(function(row) {
  panel.add(row);
});

var temporal_difference = ui.Textbox({value: 12,style: {width: '40px'}});

panel.add((ui.Panel([ui.Label('Sentinel-1/-2 temporal difference (hours)'), temporal_difference],ui.Panel.Layout.flow('horizontal'))))

// --- Null Handling Options ---
var nullHandlingSelect = ui.Select({
  items: [
    {label: 'Exclude All Nulls', value: 'ExcludeAllNulls'},
    {label: 'Include Optical Nulls', value: 'IncludeOpticalNulls'},
    {label: 'Include All Nulls', value: 'IncludeAllNulls'}
  ],
  value: 'ExcludeAllNulls',
  placeholder: 'Select Null Handling Option'
});

panel.add((ui.Panel([ui.Label('Null Handling', {fontWeight: 'bold'}), nullHandlingSelect],ui.Panel.Layout.flow('horizontal'))));

// Apply Button
var applyButton = ui.Button({
  label: 'Apply Settings & Run',
  onClick: function () {
    
    var startDate = startDateInput.getValue();
    var endDate = endDateInput.getValue();
    var GenerateRandomPoints = genPointsCheckbox.getValue() ? 'YES' : 'NO';
    var ESA_LC_type = lcDropdown.getValue().split(' ')[0]; // Numeric part
    var numberOfRandomPoints = numPointsSlider.getValue();
    var buffer = parseInt(bufferInput.getValue(), 10);
    var max_clouds = cloudSlider.getValue();
    var QA_BAND = 'cs';
    var CLEAR_THRESHOLD = thresholdSlider.getValue();
    var speckleFiltering = CheckboxSpeckle.getValue() ? 'YES' : 'NO';
    var kernelSize = speckleKernelInput.getValue();
    var S1S2hoursDifference = temporal_difference.getValue();
    var NullHandling = nullHandlingSelect.getValue();
    var ROI = ee.FeatureCollection(assetTextbox.getValue());

    var listOfOpticalVIs = opticalOptions.filter(function(opt, i) {
      return opticalCheckboxes[i].getValue();
    });
    var listOfSARindices = sarOptions.filter(function(opt, i) {
      return sarCheckboxes[i].getValue();
    });

    // Selected country for broadGeometry
    var selectedCountry = countrySelector.getValue();
    var broadGeometry = countries.filter(ee.Filter.eq('country_na', selectedCountry)).geometry();

    Map.clear(); // Optional: Clear previous layers

    // print('Selected Optical Indices:', selectedOptical);
    // print('Selected SAR Indices:', selectedSAR);
    // print('Land Cover:', ESA_LC_type);
    // print('Date Range:', startDate, 'to', endDate);
    // print('Generate Points:', GenerateRandomPoints);
    // print('Points:', numberOfRandomPoints, '| Buffer:', buffer, 'm | Max Cloud:', max_clouds + '%');
    // print('Selected Country:', selectedCountry);

    statusLabel.setValue('Settings updated successfully.');
    

// ========================================================================================
// ================================ Load satellite data  ==================================
// ========================================================================================

// Load ancillary data
var CoprenicusDEM = ee.ImageCollection("COPERNICUS/DEM/GLO30").select('DEM').filterBounds(broadGeometry),
    gfc = ee.Image("UMD/hansen/global_forest_change_2023_v1_11"),
    ESAWC = ee.ImageCollection("ESA/WorldCover/v200").first(),
    CGLC = ee.Image("COPERNICUS/Landcover/100m/Proba-V-C3/Global/2019")
            .select('discrete_classification'),
    corine = ee.Image("COPERNICUS/CORINE/V20/100m/2018").select('landcover');


// Code to set whether to generate random points or no
if (GenerateRandomPoints == 'YES'){
  // add land cover and forest-oriented databases
  var ESAWC = ee.ImageCollection("ESA/WorldCover/v200").first();
  
  if (ESA_LC_type == 'ALL') {
    var ESAWC_selected = ESAWC;
  } 
  else
    // Load the ESA WorldCover Layers and use only the selected land cover type
    var ESAWC_selected = ESAWC.updateMask(ESAWC.eq(ESA_LC_type));
  
  
  Map.addLayer(ESAWC_selected.clip(broadGeometry), {}, 'Selected land cover type');
  Map.centerObject(broadGeometry, 6);
  
  if (ownDataCheckbox.getValue() == true){
    var broadGeometry = ee.Feature(ROI.union().first()).bounds().buffer(1000).geometry(); // add a 1 km buffer
  }
  else {
    var broadGeometry = broadGeometry;
  }
  
  // Create 1000 random points in the 20x20km bounding box
  var randomPoints = ee.FeatureCollection.randomPoints(broadGeometry, numberOfRandomPoints);
  
  // create buffer around random points
  var bufferedPoints = randomPoints.map(function (point) {
                                        return point.buffer(buffer).bounds().set('ID', point.id()) }
                                        );
  
  // Extract values
  var calculatedPoints = ESAWC_selected.unmask().reduceRegions({
                            collection: bufferedPoints,
                            reducer: ee.Reducer.mean(),
                            scale: 20,
                        });
  
  if (ESA_LC_type == 'ALL') {
    // Select only areas that are fully inside one selected land cover type
    var validPoints = calculatedPoints.filter(ee.Filter.inList('mean',[10,20,30,40,50,60,70,80,90,95,100]));
    print('Size of the final set of areas:', ROI.size())
    
  } 
  else if (ESA_LC_type == '10 - Tree cover'){
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', 10));
    print('Size of the final set of areas:', ROI.size())

  ROI = validPoints
  }
  else if (ESA_LC_type == '20 - Shrubland'){
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', 20));
    print('Size of the final set of areas:', ROI.size())

  ROI = validPoints
  }
  else if (ESA_LC_type == '30 - Grassland'){
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', 30));
    print('Size of the final set of areas:', ROI.size())

  ROI = validPoints
  }
  else if (ESA_LC_type == '40 - Cropland'){
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', 40));
    print('Size of the final set of areas:', ROI.size())

  ROI = validPoints
  }
  else if (ESA_LC_type == '50 - Built-up'){
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', 50));
    print('Size of the final set of areas:', ROI.size())

  ROI = validPoints
  }
}
else if(GenerateRandomPoints == 'NO'){
  ROI = ROI
}


// Define a function to compute slope and aspect for each image
  var calculateSlopeAspect = function(image) {
    // Compute slope and aspect
    var slope = ee.Terrain.slope(image);
    var aspect = ee.Terrain.aspect(image);
    
    // Return the image with new bands for slope and aspect
    return image.rename('DEM').addBands(slope.rename('slope')).addBands(aspect.rename('aspect'));
  };
  
  CoprenicusDEM = ee.Join.saveAll("match").apply(CoprenicusDEM,CoprenicusDEM,ee.Filter.withinDistance({distance:300, leftField:'.geo', rightField: '.geo', maxError:100}));
  
  CoprenicusDEM = ee.ImageCollection(CoprenicusDEM).map(function(im){
    var extendedIM = ee.ImageCollection(ee.List(im.get("match"))).mosaic().setDefaultProjection(im.projection());
    return calculateSlopeAspect(extendedIM).clip(im.geometry());
  });

var dem = CoprenicusDEM.select('DEM').mosaic().rename('DEM');
var slope = CoprenicusDEM.select('slope').mosaic().rename('slope');

// Add Sentinel-2 data
var S2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
          .filterBounds(ROI.geometry())
          .filterDate(startDate, endDate)
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',max_clouds))
          // .select(['B2','B3','B4','B5','B6','B7','B8','B11','B12','B8A', 'SCL']);
print('Number of S-2 images after filtering', S2.size());


// Add Sentinel-1 data
var S1Collection = ee.ImageCollection('COPERNICUS/S1_GRD_FLOAT')
                  .filterBounds(ROI.geometry())
                  .filterDate(startDate, endDate)
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
print('Number of S-1 images after filtering', S1Collection.size());


// ========================================================================================
// =========================== SAR polarimtric indices  ===================================
// ========================================================================================

// Function to add kradar polarimetric indices
var addSARIndices = function(img) {
  var VV = img.select('VV');
  var VH = img.select('VH');

  var VH_VV = VH.divide(VV).rename('VH/VV');

  var VV_VH = VV.divide(VH).rename('VV/VH');
              
  var RVI = (ee.Image(4).multiply(VH))
            .divide(VV.add(VH)).rename('RVI');
            
  var RFDI = (VV.subtract(VH))
              .divide(VV.add(VH)).rename('RFDI'); 

  var NRPB = (VH.subtract(VV))
              .divide(VH.add(VV)).rename('NRPB');
  
  var DPSVIm = img.expression(
    '(VV*VV+VV*VH)/1.414213562373095',{
      'VH': img.select('VH'),
      'VV': img.select('VV')
  }).rename('DPSVIm');
 
  var SARindices = ee.Image(0).addBands([VV,VH, RVI, RFDI, NRPB,VH_VV,VV_VH, DPSVIm]);
 
  return img.addBands(SARindices.select(listOfSARindices));
};


// ========================================================================================
// =========================== Optical vegetation indices  ================================
// ========================================================================================

// Function to add optical vegetation indices (VI)
var addOpticalVI = function(img) {
  var EVI = img.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
            'NIR': img.select('B8').divide(10000),
            'RED': img.select('B4').divide(10000),
            'BLUE': img.select('B2').divide(10000)
        }).rename("EVI")
  
  return img
    .addBands([
                img.normalizedDifference(['B8', 'B4']).rename('NDVI'), 
                img.normalizedDifference(['B8', 'B5']).rename('NDVIrededge'),
                img.normalizedDifference(['B3', 'B8']).rename('NDWI'),
                img.normalizedDifference(['B8', 'B11']).rename('NDMI'),
                img.normalizedDifference(['B3', 'B11']).rename('NDSI'),
                EVI
                ]
              );
};

// ================= FAPAR and LAI ================= //
{ 
  /*--------------------------------------------------------------------------------------------------------
This script aims to show Sentinel-2 biophysical parameter retrievals through GEE, based on the 
S2ToolBox methodology.
For algorithm details, see the original ATBD: https://step.esa.int/docs/extra/ATBD_S2ToolBox_L2B_V1.1.pdf

Currently, only FAPAR and LAI (both 3-band and 8-band versions) have been implemented. fCOVER, CCC and CWC can 
be done as well. Input should always be Sentinel-2 L2A products. 

There has been --no-- thorough validation of this code.
Please use at your own risk and provide feedback to:

kristofvantricht@gmail.com

Available at GitHub: https://github.com/kvantricht/gee-biopar
and Zenodo: https://zenodo.org/records/10103929
--------------------------------------------------------------------------------------------------------
*/

// Import the biopar module
var biopar = require('users/kristofvantricht/s2_biopar:biopar');

function addFAPARandLAI (img) {
  var FAPAR = biopar.get_fapar(img).rename('FAPAR');
  var LAI = biopar.get_lai(img).rename('LAI');
  var FAPAR_3b = biopar.get_fapar3band(img).rename('FAPAR_3b');
  var LAI_3b = biopar.get_lai3band(img).rename('LAI_3b');
  
  return img.addBands([FAPAR ,LAI,LAI_3b,FAPAR_3b])
}

}

// ========================================================================================
// ================= Mask out clouds, shadows and snow in S2 images  ======================
// ========================================================================================

// ====================== Cloud masking using the Cloud Score+ ==================== //
// Cloud Score+ image collection. Note Cloud Score+ is produced from Sentinel-2
// Level 1C data and can be applied to either L1C or L2A collections.
var csPlus = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED')
                  .filterBounds(ROI) // spatial filter
                  .filterDate(startDate, endDate) // temporal filter

// Use 'cs' or 'cs_cdf', depending on your use-case; see docs for guidance.
var QA_BAND = QA_BAND;

// The threshold for masking; values between 0.50 and 0.65 generally work well.
// Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = CLEAR_THRESHOLD;

// Link the datasets
var linkedS2 = S2.linkCollection(csPlus, [QA_BAND]);

// Create a function to unmask each image
function unmask_with_cloudPlus(img) {
      var unmasked = img.updateMask(img.select(QA_BAND).gte(CLEAR_THRESHOLD));
      return unmasked;
    }

// Apply the function to get a cloudless image collection
var S2_cloudMasked = linkedS2.map(unmask_with_cloudPlus);

// Snow mask with Scene Classification Layer & a strict NDSI threshold (0)
function snowMask (image){
  return image.updateMask(image.select('NDSI').lt(0))
              .updateMask(image.select('SCL').neq(11))
}

// // Add optical and SAR indices to the data
var S2 = S2_cloudMasked.map(addOpticalVI)
                       .map(addFAPARandLAI)
                       .map(snowMask)
                       .select(listOfOpticalVIs)

// ========================================================================================
// =========================== Add weather information  ===================================
// ========================================================================================
// load the ERA5 dataset
var ERA5 = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
                .filterDate(startDate, endDate);

// function to add sums of precipitation for previous 3 and 12 hours
var addweatherData = function (img) {

  var startDateLast12hours = ee.Date(ee.Number.parse(img.get('system:time_start'))
                                .subtract(43200000)).format();
                                // 43 200 000 (12 hours in miliseconds)
  
  var endDate = ee.Date(ee.Number.parse(img.get('system:time_start'))
                  .add(3600000)).format();
                  // add one hour to include values from the sensing time, too
                  // 3 600 000 (1 hour in milisenconds)
  
  var currentDate = ee.Date(img.get('system:time_start')).format();
  
  // filter out ERA5-Land data
  var precipitation12hours = ERA5.select('total_precipitation_hourly')
                      .filterDate(startDateLast12hours, endDate)
                      .sum().multiply(1000) // in mm
                      .rename('precipitation12hours');

  var temperature = ERA5.select('temperature_2m')
    .filterDate(currentDate, endDate).first().subtract(ee.Image(273.15)).rename('temperature');

  var precipitationCurrent = ERA5.select('total_precipitation_hourly')
    .filterDate(currentDate, endDate).first().multiply(1000) // in mm
    .rename('precipitationCurrent');
  
  return img.addBands([precipitation12hours.clip(img.geometry()), 
  temperature.clip(img.geometry()), precipitationCurrent.clip(img.geometry())]);
};

// ========================================================================================
// ================= Add weather and DEM information to each S1 image  ====================
// ========================================================================================
S1Collection = S1Collection
              // add DEM information
              .map(function (img){
                return img.addBands([dem.clip(img.geometry()),slope.clip(img.geometry())])
              })
              // add weather data
              .map(addweatherData);

// ========================================================================================
// ======================== Create the MMT-GEE dataset  ===================================
// ========================================================================================

function join_S1_S2 (image) {
  var s1_selected = image;
  var s1_date = s1_selected.get('system:time_start');
  var s2_byDate = S2.filterDate(ee.Date(s1_date).advance(-S1S2hoursDifference, 'hour'),
                                ee.Date(s1_date).advance(S1S2hoursDifference, 'hour'));
  var s2_byArea = s2_byDate.filterBounds(s1_selected.geometry());

  // save S2 ID property
  var s2_selected = s2_byArea.mosaic();
  
  // add the size of S2 collection
  var s2_size = s2_byArea.size()
  
  var final = s1_selected.addBands(s2_selected).setMulti({
  s2_size: s2_size
  });
  
  return ee.Image(final)
}

var joined_all = S1Collection.map(join_S1_S2);

// print(joined_all, 'joined_all');

// Filter out lonely S1 images
var joined = ee.ImageCollection(joined_all).filter(ee.Filter.gt('s2_size',0));
// print(joined, 'joined');
 
// ============================================================================
// ======================= ADD LIA  ===========================================
// ============================================================================

// Add Local Incidence Angle (LIA) from Copernicus DEM
// call the addLIA function 
var addLIA = require('users/danielp/functions:addLIA');
var joined = addLIA.addLIA(joined,broadGeometry);


// ============================================================================
// ======================= SPECKLE FILTERING ==================================
// ============================================================================
var KERNEL_SIZE = kernelSize;

var leefilter = function(image) {
//---------------------------------------------------------------------------//
// Lee filter in GEE, implementation based on Mullissa et al. 2021: https://doi.org/10.3390/rs13101954  
//---------------------------------------------------------------------------//
/** Lee Filter applied to one image. It is implemented as described in 
 J. S. Lee, “Digital image enhancement and noise filtering by use of local statistics,” 
 IEEE Pattern Anal. Machine Intell., vol. PAMI-2, pp. 165–168, Mar. 1980.*/
 
        var bandNames = ['VV','VH'];
        //S1-GRD images are multilooked 5 times in range
        var enl = 5
        // Compute the speckle standard deviation
        var eta = 1.0/Math.sqrt(enl); 
        eta = ee.Image.constant(eta);

        // MMSE estimator
        // Neighbourhood mean and variance
        var oneImg = ee.Image.constant(1);

        var reducers = ee.Reducer.mean().combine({
                      reducer2: ee.Reducer.variance(),
                      sharedInputs: true
                      });
        var stats = image.select(bandNames).reduceNeighborhood({reducer: reducers,kernel: ee.Kernel.square(KERNEL_SIZE/2,'pixels'), optimization: 'window'})
        var meanBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_mean')});
        var varBand = bandNames.map(function(bandName){return ee.String(bandName).cat('_variance')});
        
        var z_bar = stats.select(meanBand);
        var varz = stats.select(varBand);

        // Estimate weight 
        var varx = (varz.subtract(z_bar.pow(2).multiply(eta.pow(2)))).divide(oneImg.add(eta.pow(2)));
        var b = varx.divide(varz);
  
        //if b is negative set it to zero
        var new_b = b.where(b.lt(0), 0)
        var output = oneImg.subtract(new_b).multiply(z_bar.abs()).add(new_b.multiply(image.select(bandNames)));
        output = output.rename(bandNames);
        return image.addBands(output, null, true);
  }   

// Set Null handling based on the user preferences
if (speckleFiltering == 'YES'){
  // Apply the Lee filter
  var speckle_filtered_joined = joined.map(leefilter);
}
else if(speckleFiltering == 'NO'){
  // Do not apply the Lee filter
  var speckle_filtered_joined = joined;
}

// change linear units to dB for VV and VH
function powerToDb_VV_VH (img){
  return img.addBands(ee.Image(10).multiply(img.select(['VV','VH']).log10()).rename(['VV','VH']),null,true)
}

// Add SAR polarimetric indices and conver VV and VH to dB scale
var corrected_joined = speckle_filtered_joined.map(addSARIndices).map(powerToDb_VV_VH)
// print(corrected_joined)

// ============================================================================
// ====================== Prepare and export data =============================
// ============================================================================

var getData = corrected_joined.map(function(img){
    return img.reduceRegions({collection: ROI, reducer: ee.Reducer.mean(), scale: 20});
  });

// Set Null handling based on the user preferences
if (NullHandling == 'ExcludeAllNulls'){
  var to_export = getData.flatten().filter(ee.Filter.notNull(['LAI','VH'])).filter(ee.Filter.neq('LAI',0)).filter(ee.Filter.neq('DEM',0));
   print('All Null values for both optical and SAR features will be excluded from the expored table.')
}
else if(NullHandling == 'IncludeOpticalNulls'){
  var to_export = getData.flatten().filter(ee.Filter.notNull(['VH'])).filter(ee.Filter.neq('LAI',0)).filter(ee.Filter.neq('DEM',0));
  print('Null values for optical indices will be included in the expored table.')
}
else if(NullHandling == 'IncludeAllNulls'){
  var to_export = getData.flatten().filter(ee.Filter.neq('LAI',0)).filter(ee.Filter.neq('DEM',0));
  print('All Null values will be included in the expored table.')
}

// export data to Drive
Export.table.toDrive({
    collection: to_export,
    description: 'MMTS_GEE_data',
    folder: 'MMTS_GEE',
    fileNamePrefix: 'MMTS_GEE_data',
    fileFormat: 'CSV'
});

// Print some instructions for the user
print('For data export click on "Tasks" bar on the right panel and click on "Run".')

}
});
panel.add(applyButton);
panel.add(ui.Label("To download the data, swipe down the code editor and RUN the export in 'Tasks' panel on the right handside.", {
  color: 'gray',
  margin: '6px 0px 0px 8px'
}));
