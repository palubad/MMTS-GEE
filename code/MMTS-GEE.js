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

If you use this tool, please cite the following paper:
  Paluba, D., Le Saux, B., Sarti, F., Štych, P. (2024): 
  Identification of Optimal Sentinel-1 SAR Polarimetric Parameters for Forest Monitoring 
  in Czechia. AUC Geographica 59(2), 1–15, DOI: https://doi.org/10.14712/23361980.2024.18

The full documentation on the use of this can be found on GitHub: 
  github.com/palubad/MMTS-GEE
*/

// ========================================================================================
// =========================== START OF USER SETTINGS =====================================
// ========================================================================================

// 1. Set start and end date for time series generation
var startDate = '2021-01-01',
    endDate =   '2022-01-01';

// 2. Decide whether to generate random points based on a predefined land cover 
//    dataset or upload your own data. 
var GenerateRandomPoints = 'YES';
/* 
  If 'YES':
          2.1. Set an integer value (10-100) to ESA_LC_type to define for which land cover type do you want to generate your random points.
               Set 'ALL' if you want to include each land cover type. The ESA World Cover 2021 used here.
               See the available land cover classes and their integer values: https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v200 
          2.2. Set how many random points to generate in the numberOfRandomPoints variable.
          2.3. Set the buffer around random points (in meters) in the buffer variable.
  If 'NO':
          2.1. Set your own FeatureCollection in the ROI variable.
*/

// 2. A) Settings if 'YES' was set in GenerateRandomPoints
var ESA_LC_type = 'ALL'; // use 'ALL' if you want to generate random points for each land cover type
                        // set e.g. 10 for forest cover 
var numberOfRandomPoints = 1000; 
var buffer = 20;         // set a square buffer around points 

// 2. B) Import and use your own FeatureCollection if 'NO' was set in GenerateRandomPoints
var ROI = ee.FeatureCollection("users/danielp/philab/coniferous_FINAL");
// for conif: "projects/danielp-cuni/assets/philab/conif_CentralEurope_FINAL"

// 3. Select a broader geometry for your analysis, e.g. a country or draw/upload your own area
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0");

// 3. A) Select a country
// var broadGeometry = countries.filter(ee.Filter.eq('ADM0_NAME','Czech Republic'));

// 3. B) Select the area based on your input data, applicable when you uploaded your own data in 2. B)
var broadGeometry = ee.Feature(ROI.union().first()).bounds().buffer(1000).geometry(); // add a 1 km buffer

// 4. Set Sentinel-2 data preprocessing 
// 4.1. Set the maximum threshold for single image cloud coverage for S2 data
var max_clouds = 30;

// 4.2. Use 'cs' or 'cs_cdf' bands for cloud masking using CloudScore+.
var QA_BAND = 'cs';

// 4.3. Set the  threshold for cloud masking. 
//      Higher values will remove thin clouds, haze & cirrus shadows.
var CLEAR_THRESHOLD = 0.60;

// 5. Select optical indices and parameters to include in the export
//    predefined optionsare: 'NDVI','NDVIrededge','FAPAR','LAI', 'FAPAR_3b','LAI_3b', 'EVI','NDMI'
var listOfOpticalVIs = ['NDVI','FAPAR','LAI','EVI'];

// 6. Select SAR polarimetric indices to export.
//    predefined options are: 'RVI', 'RFDI', 'NRPB','VH_VV','VV_VH', 'DPSVIm', 'DPSVIo'
var listOfSARindices = ['VV','VH','RVI', 'RFDI', 'NRPB','VH/VV','VV/VH', 'DPSVIm'];

// 7. Select whether to perform speckle filtering using Lee filter. 
//    If 'YES', set the kernel window size. 
//    Set 'NO' to do not perform speckle filtering.
var speckleFiltering = 'YES';
var kernelSize = 5;

// 8. Set how many hours of difference between S1 and S2 images will be allwoed
var S1S2hoursDifference = 24;

// 9. Set export settings regarding Null values
var NullHandling = 'ExcludeAllNulls';
// 'ExcludeAllNulls'     = All Null values for both optical and SAR features will be excluded from the expored table.
// 'IncludeOpticalNulls' = Null values for optical indices will be included in the expored table.
// 'IncludeAllNulls'     = All Null values will be included in the expored table.

// ========================================================================================
// =============================== END OF USER SETTINGS ===================================
// ========================================================================================





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
  } 
  else
    // Select points which fall (at least partly) into the masked region
    var validPoints = calculatedPoints.filter(ee.Filter.eq('mean', ESA_LC_type));
  
  ROI = validPoints
}
else if(GenerateRandomPoints == 'NO'){
  ROI = ROI
}

print('Size of the final set of areas:', ROI.size())

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

// Function to add radar polarimetric indices
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
// ================= Mask out clouds, shadows in S2 images  ======================
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

// // Add optical and SAR indices to the data
var S2 = S2_cloudMasked.map(addOpticalVI)
                       .map(addFAPARandLAI)
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
var KERNEL_SIZE = 5; // for 5x5 filter

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
print(to_export)
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
