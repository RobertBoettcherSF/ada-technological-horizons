with Interfaces;

package Ath_Research_Exports is
   function Ath_Research_F64
     (Discoveries_0, Researchers_0, Discovery_Doubling, Researcher_Doubling, Elapsed : Long_Float)
      return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_research_f64";

   function Ath_Research_Discoveries return Long_Float
   with Export, Convention => C, External_Name => "ath_research_discoveries";

   function Ath_Research_Researchers return Long_Float
   with Export, Convention => C, External_Name => "ath_research_researchers";

   function Ath_Research_Ratio return Long_Float
   with Export, Convention => C, External_Name => "ath_research_ratio";

   function Ath_Research_X_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_research_x_max";

   function Ath_Research_Index_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_research_index_max";

   function Ath_Research_Ratio_Max return Long_Float
   with Export, Convention => C, External_Name => "ath_research_ratio_max";

   function Ath_Research_Sample_Count return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_research_sample_count";

   function Ath_Research_Sample_Time
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_research_sample_time";

   function Ath_Research_Sample_Discoveries
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_research_sample_discoveries";

   function Ath_Research_Sample_Researchers
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_research_sample_researchers";

   function Ath_Research_Sample_Ratio
     (Index : Interfaces.Integer_32) return Long_Float
   with Export, Convention => C, External_Name => "ath_research_sample_ratio";
end Ath_Research_Exports;
