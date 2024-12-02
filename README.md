# A Google Earth Engine tool to generate multi-modal and multi-temporal datasets (MMTS-GEE)
A Google Earth Engine tool to generate multi-modal and multi-temporal datasets, including spatially and temporally aligned Sentinel-1 SAR data, Sentinel-2 multispectral data, weather and DEM-based data.
This tool is a supplementary material for the following article:
> Paluba, D., Le Saux, B., Sarti, F., Štych, P. (2024): Identification of Optimal Sentinel-1 SAR Polarimetric Parameters for Forest Monitoring in Czechia. AUC Geographica 59(2), 1–15, DOI: [10.142/23361980.2024.18](https://doi.org/10.142/23361980.2024.18) [accepted for publication, the online version will be available soon].
<br>

![Fig  2](https://github.com/user-attachments/assets/4ade6475-bbfb-45d2-9f1b-2309e0c822b8)
_Data pre-processing and preparation workflow of the MMTS-GEE._

The proposed MMTS-GEE tool, which generates a temporally and spatially paired time series dataset of S1, S2, DEM and weather data, has several parameters, which the user can set to customize the area of interest, time range, the preprocessing pipeline or export settings. The following settings can be set in the GEE environment: 
- Time series length: Set the start and end dates to generate time series.
- Random point generation: If enabled, users can specify the type of land cover from the ESA World Cover 2021 to generate random points, the number of these points, and a buffer around each point. Alternatively, users can import their own spatial data as a GEE FeatureCollection and use it in time series generation.
- Geographical coverage: Select a broad geometry like an entire country or manually draw a custom ROI, needed for the initial data assessment.
- Sentinel-2 data preprocessing: Settings to adjust the CloudScore+ algorithm settings for cloud unmasking are available.
- Optical and SAR indices: Choose from a list of predefined optical and SAR polarimetric indices to include in the output.
- Speckle Filtering: There is an option to perform speckle filtering on SAR data using a Lee filter, with configurable kernel window size.
- S1-S2 temporal difference: Set the temporal difference between the S1 and S2 images when pairing them temporally can be set.
- Null Value Handling: Decide how to handle null values in the exported data, with options to exclude all rows with nulls, include only rows where optical indices have nulls, or include all nulls.

It should be noted that the MMTS-GEE code is freely available, therefore, other settings, not included in the recommended user settings listed above, can be adjusted by editing the code. To list a few, users can create their own optical or SAR indices, select a different land cover database for random point generation, set a different speckle filtering approach, or integrate other ancillary data to enhance the multi-modality of the created time series dataset.
