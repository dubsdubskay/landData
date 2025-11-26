#import libraries used in the APP
library(shiny)
library(sf)
library(leaflet)
library(dplyr)
library(RColorBrewer)
library(htmlwidgets)
library(htmltools)
library(ggplot2)
library(bslib)
library(stringr)
library(scales)
library(readr)
library(shinythemes)
library(DT)
library(stringr)

#set the working directory
#save the shapefile with the attribute table in the variable us
# us <- st_read("counties_with_table.shp") 

#filter the data set by the three countries selected in the APP
# 
#us <- us %>% filter(STATE_A=='WV'| STATE_A=='VA'| STATE_A =='MD')
# us <- us %>% filter(STATE_A=='VA')

us <- st_read("VA_shape.shp")
#transform the geometry to Web Mercator

us <- st_transform(us, crs=4326)

# temp_pal <- colorBin(palette="YlOrRd", domain=us$tempmn, bin=5)
# pop_pal <- colorNumeric(palette= 'Purples', domain= us$POPULAT)
# ncm_pal <- colorNumeric(palette= 'Greens', domain= us$med_ncm)

# split city name from between 1st and 2nd comma
 propData <- read_csv("https://raw.githubusercontent.com/dubsdubskay/landData/main/porpertySearch.csv", col_names = TRUE) #, col_types = cols(category = col_factor()))

#propData <- read.csv("porpertySearch.csv")
propData <- propData %>%
  mutate(city = str_trim(str_extract(address, "(?<=,)[^,]*(?=,)")), .before =county
  ) 

# css <- "
# .nowrap {
#   white-space: nowrap;
# }"

# Define UI for the APP
ui <- fluidPage(
  theme = shinytheme("slate"), #bs_theme(version = 4, bootswatch = "spacelab"), # theme from the library(bslib)
  
  # titlePanel(h1("Virginia ",align = "center", style = "color:#0d793e")), # Main title of the App use h1
  # It is easier to change font and color out of titlePanel
  h1(id ="va_land", "Kulzy's Southfork Virginia Ranch"), # Main title of the App use h1
  tags$style(HTML("#va_land{color: maroon;
                   font-size: 58px;
           font-style: bold;}")),
  
  br(),
  br(),
   # fluidRow(
   #   column(11, DT::dataTableOutput('x1'))#,
   # ),
  navbarPage(#the tabset panel layout will include the three tab
    ### add your style inline css values here
    
    ### added a line of code here too `.dataTables_wrapper .dataTables_paginate .paginate_button.current:hover `###
    tags$style(HTML("
                    .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_filter, .dataTables_wrapper .dataTables_info, .dataTables_wrapper .dataTables_processing, .dataTables_wrapper .dataTables_paginate, .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover {
                    color: #ffffff;
                    }
### ADD THIS HERE ###
                    .dataTables_wrapper .dataTables_paginate .paginate_button{box-sizing:border-box;display:inline-block;min-width:1.5em;padding:0.5em 1em;margin-left:2px;text-align:center;text-decoration:none !important;cursor:pointer;*cursor:hand;color:#ffffff !important;border:1px solid transparent;border-radius:2px}

###To change text and background color of the `Select` box ###
                    .dataTables_length select {
                           color: #0E334A;
                           background-color: #0E334A
                           }

###To change text and background color of the `Search` box ###
                    .dataTables_filter input {
                            color: #0E334A;
                            background-color: #0E334A
                           }

                    thead {
                    color: #ffffff;
                    }

                     tbody {
                    color: #000000;
                    }

                   "


    )),
    #Tab 3: Interactive Map
    tabPanel("Interactive Map", #title of the third tab  
           #  sidebarLayout(    
               sidebarPanel(#left section of the page used by the user to select input
                 selectInput(inputId = "countryInput", #unique input ID
                             label= "Choose a State",
                             choices = unique(us$STATE_N),
                             selected = "Virginia"),
                 selectInput(inputId = "varInput", #unique input ID
                             label= "Choose a county",
                             #   choices = c('',"Temperature", 'Population', 'Income'))
                             choices = us$NAME,
                             selected = "Chesterfield County"
                             ),
                 #     uiOutput("tab")
                 #    textInput("tab", "WebSites")
                 DT::dataTableOutput('table')
                 , 

                 h5("Powered by",
                    img(src = "Kulzy-Design-Logo2Gold.png", height = 75,
                        width = 75),
                    )
               ),
               
               mainPanel(# right section of the page 
                 leafletOutput("map", #output ID
                               width = "100%", height = "500px")),
                  fluidRow(
                    column(11, DT::dataTableOutput('x1'))#,
                  )
      #       )# sidebarLayout
    )  # tabPanel Interactive Map
  ),)

# Define server logic 
server <- function(input, output, session) {
  
  output$x1 = DT::renderDataTable({
    DT::datatable(propData[,-c(13)], rownames = FALSE, 
                                  options = list(pageLength = 7,
                                                 scrollX = TRUE, 
                                                  autowidth = TRUE #,
                                                 # columnDefs = list(
                                                 #   list(className = "nowrap", targets = c(3)
                                                 #   ))
                                                 )
    )
    
  })
  
  selectedCountry1 <- reactive({#reactive expression for the Data Explorer
    us[us$STATE_N == input$countryInput1, ] #match input of the user with the state name
  })
  
  selectedCountry <- reactive({ #reactive expression for the Interactive Map
    us[us$STATE_N == input$countryInput, ] #match input of the user with the state name
  })
  
  selectedCounty <- reactive({ #reactive expression for the Interactive Map
    us[us$NAME == input$varInput, ] #match input of the user with the state name
  })
  
  city_info <- reactive({propData[input$x1_rows_selected,] %>%
    mutate(Lat = as.numeric(Lat),
           Long = as.numeric(Long))
  })
  
  time <- reactive({propData[input$x1_rows_selected,] %>%
      mutate(Lat = as.numeric(Lat),
             Long = as.numeric(Long))%>%
    mutate(min = (hours_home - trunc(hours_home)) *60,
           hr = floor(hours_home)
    )
  })
  
  output$map <- renderLeaflet({#Interactive Map tab output
    leaflet('map',
            data = selectedCountry()#, #base map
            #       options = leafletOptions(zoomControl= FALSE)
    ) %>%
      # addTiles(group = "OSM") %>%
      
      addPolygons(color = "gray", 
                  fillColor = "orange", 
                  weight = 1, 
                  smoothFactor = 0.5,
                  opacity = 1.0, 
                  fillOpacity = 0.2 # ,
                  #     label = ~NAME #,
                  #     highlightOptions = highlightOptions(color = "white", weight = 2,
                  #                                         bringToFront = TRUE)
      ) %>%
      
           htmlwidgets::onRender("function(el, x) {
           L.control.zoom({ position: 'topright' }).addTo(this)
      }") %>%
      addProviderTiles("OpenStreetMap", group="OSM") %>%
      
      addProviderTiles("Esri.NatGeoWorldMap", group="ESRI") %>%
      
      addProviderTiles("CartoDB.DarkMatter", group= "CartoDB") %>%
      
       addLayersControl(baseGroups = c("OSM", "CartoDB","ESRI")) %>%
      
      # addLegend(position="bottomright", pal=temp_pal, values=us$tempmn, title="Temperature")%>%
      # addLegend(position="bottomright", pal=pop_pal, values=us$POPULAT, title="Population")%>%
      
      #  addLegend(position="bottomleft", pal=ncm_pal, values=us$med_ncm, title="Whateves in $")%>%
      setView(lat= 37.5, lng=-77.4, zoom=6.5)
  })
  
  observe({#observer
    high_opt <- highlightOptions(weight = 1, color = "red", bringToFront = FALSE) #highlight when user select county
    #
    state_popup <- paste0("<strong>County: </strong>", #popup
                          selectedCountry()$NAME,
                          #  "<br><strong> Temperature: </strong>",
                          #  round(selectedCountry()$tempmn,1),"&#x2103",
                          "<br><strong> Median Income: </strong>",
                          dollar(selectedCountry()$med_ncm),
                          "<br><strong> Population: </strong>",
                          comma(selectedCountry()$POPULAT))
    
    ## Leaflet map
    leafletProxy("map",  data = selectedCountry()#, 
                 #   options = leafletOptions(zoomControl= FALSE)
    ) %>%
      
    #  addTiles(group = "OSM") %>%
      
      addPolygons(fillColor = "orange",
                  #         addPolygons(fillColor =  temp_pal(selectedCounty()),
                  popup = state_popup,
                  #      label = ~NAME,
                  col="white",
                  fillOpacity = .2,
                  smoothFactor = 0.5,
                  weight = 1,
                  highlight = high_opt ) %>%
      # 
      # htmlwidgets::onRender("function(el, x) {
      #       L.control.zoom({ position: 'topright' }).addTo(this)
      #   }") %>%
      # 
      addProviderTiles("OpenStreetMap", group="OSM") %>%
      
      addProviderTiles("Esri.NatGeoWorldMap", group="ESRI") %>%
      
      addProviderTiles("CartoDB.DarkMatter", group= "CartoDB") %>%
      
      addLayersControl(baseGroups = c("OSM", "CartoDB","ESRI")) %>%
      
      # addLegend(position="bottomright", pal=temp_pal, values=us$tempmn, title="Temperature")%>%
      # addLegend(position="bottomright", pal=pop_pal, values=us$POPULAT, title="Population")%>%
      
      #  addLegend(position="bottomleft", pal=ncm_pal, values=us$med_ncm, title="Whateves in $")%>%
      setView(lat= 37.5, lng=-77.4, zoom=6.5)
  })
  
  observeEvent(input$varInput, {
  #  print(head(selectedCounty()))
    
    state_popup <- paste0("<strong>County: </strong>", #popup
                          input$varInput,
                          #  "<br><strong> Temperature: </strong>",
                          #  round(selectedCountry()$tempmn,1),"&#x2103",
                          "<br><strong> Median Income: </strong>", 
                          dollar(selectedCounty()$med_ncm),
                          "<br><strong> Population: </strong>",
                          comma(selectedCounty()$POPULAT))
    
    leafletProxy("map") %>% #, deferUntilFlush = FALSE) %>%
      clearGroup("county") %>%
      addPolygons(data = selectedCounty(), group = "county",
                  fillColor = "yellow",
                  popup = state_popup,
                  fillOpacity = .4,
                  weight = 1)#,
    #      highlight = high_opt )
  })
  
  observeEvent(input$x1_rows_selected, {
    #   
    high_optCir <- highlightOptions( bringToFront = TRUE) 
    # city_info <- propData[input$x1_rows_selected,] %>%
    #   mutate(Lat = as.numeric(Lat),
    #          Long = as.numeric(Long))
    # 
    # time <- city_info %>% 
    #   mutate(min = (hours_home - trunc(hours_home)) *60,
    #          hr = floor(hours_home)
    #   )
    
    #      print(head(city_info))
    cityPopup <- paste0("<strong>City: </strong>", #popup
                        city_info()$city,
                        "<br><strong> Cost: </strong>",
                        dollar(city_info()$cost),#"&#x2103",
                        "<br><strong> Time from Home: </strong>", 
                        paste(time()$hr, "hr", round(time()$min,2), " mins"),
                        "<br><strong> Acres: </strong>",
                        city_info()$acres
    )
    
    leafletProxy("map") %>% #, deferUntilFlush = FALSE) %>%
      clearGroup("city") %>%
      addCircles (data = city_info(), group = "city",
                  #     label = paste("Label", city_info$cost, city_info$acres),
                  label = paste("Click to see more info"),
                  lng = ~Long,
                  lat = ~Lat,
                  fillColor = "stone",
                  radius = (sqrt(city_info()$acres*5000)*100)/2,
                  popup = cityPopup,
                  fillOpacity = .4,
                  weight = 2,
                     highlight = high_optCir )
    
    # dt$url <- '<a href = "https://github.com">git</a>'   
    # target="_blank" causes a new browser window to open
    dt <- city_info() %>%
      # mutate(Land_website = paste('<a href = ',city_info()$website_link, 'target=','"_blank"', ">", 
      #                             city_info()$property_nm, "</a>", sep = ""
      mutate(Land_website = paste('<a href = ',city_info()$website_link,"/ ",'target=','"',"_blank",'"', 
                                  ">", city_info()$property_nm, "</a>", sep = ""
                                  ))
   
    
    output$table <- DT::renderDataTable({
   #   DT::datatable(
   #   DT::dataTableOutput(
        DT::datatable(dt[,c("city","Land_website")], escape = FALSE, 
                      rownames = FALSE
                      ,
         options = list(dom = 't')
        ) %>% DT::formatStyle(columns = 'Land_website', color="black",backgroundColor = 'orange')
    }#,
  #  options = list(
   #   info = FALSE,
  #    autoWidth = TRUE,
  #    columnDefs = list(list(width = '100px', targets = "_all"))
  #  ) #%>% DT::formatStyle(columns = 'Land_website', color="black",
      #                    backgroundColor = 'orange')
    ) #End Output table
    
  })
  
}

# Run the application 
shinyApp(ui = ui, server = server)