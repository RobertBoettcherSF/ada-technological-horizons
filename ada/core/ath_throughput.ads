with Interfaces;

--  Constant-rate information arithmetic.
--
--  A quantity divided by a rate is a time. A rate multiplied by a duration
--  is a quantity. Nothing here simulates a cell, a mind, or a channel.
--
--  The two comparison rates are the historical figures used in Constructing
--  Life: about 25 bits/s, and at least 1_000 bits/s. A low-redundancy printed
--  page in that comparison is about 10_000 bits. The bacterial figure is a
--  lower bound on the rate, so its time is an upper bound. The page and the
--  human figure are approximate, not measurements. Edited values are the
--  visitor's assumption.
--
--  A kilobit is 1_000 bits. One page unit is that 10_000-bit convention.
--  Bits per minute are divided by 60. Hours are 3_600 seconds.
package Ath_Throughput is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Throughput requires a binary64 Long_Float");

   subtype Status_Code is Interfaces.Integer_32;

   Ok                 : constant Status_Code := 0;
   Non_Finite_Input   : constant Status_Code := 1;
   Negative           : constant Status_Code := 2;
   Bad_Unit           : constant Status_Code := 3;
   Result_Not_Finite  : constant Status_Code := 4;
   Unreachable        : constant Status_Code := 5;
   Indeterminate      : constant Status_Code := 6;

   Unit_Bits     : constant Long_Float := 0.0;
   Unit_Kilobits : constant Long_Float := 1.0;
   Unit_Pages    : constant Long_Float := 2.0;

   Rate_Bits_Per_Second     : constant Long_Float := 0.0;
   Rate_Bits_Per_Minute     : constant Long_Float := 1.0;
   Rate_Kilobits_Per_Second : constant Long_Float := 2.0;
   Rate_Gigabits_Per_Second : constant Long_Float := 3.0;

   Duration_Seconds : constant Long_Float := 0.0;
   Duration_Minutes : constant Long_Float := 1.0;
   Duration_Hours   : constant Long_Float := 2.0;

   Bound_Exact : constant Long_Float := 0.0;
   Bound_Lower : constant Long_Float := 1.0;

   Page_Bits : constant Long_Float := 10_000.0;
   Human_Bits_Per_Second : constant Long_Float := 25.0;
   Bacterial_Bits_Per_Second : constant Long_Float := 1_000.0;
   Historical_Rate_Ratio : constant Long_Float := 40.0;
   --  IEEE Std 802.3 nominal 1000 Mb/s line rate (1000BASE-T / GMII).
   --  One megabit here is 1_000_000 bits, so the rate is 1_000_000_000 bits/s.
   --  That is the nominal line rate, not framed payload and not a benchmark.
   Link_Bits_Per_Second : constant Long_Float := 1_000_000_000.0;

   Preset_Count : constant := 4;

   subtype Preset_Index is Integer range 1 .. Preset_Count;

   procedure Convey
     (Quantity      : Long_Float;
      Quantity_Unit : Long_Float;
      Rate          : Long_Float;
      Rate_Unit     : Long_Float;
      Bound         : Long_Float;
      Duration      : Long_Float;
      Duration_Unit : Long_Float;
      Time_Seconds  : out Long_Float;
      Total_Bits    : out Long_Float;
      Quantity_Bits : out Long_Float;
      Rate_Bits     : out Long_Float;
      Human_Seconds : out Long_Float;
      Bacterial_Seconds : out Long_Float;
      Rate_Ratio    : out Long_Float;
      Time_Valid    : out Boolean;
      Total_Valid   : out Boolean;
      Chart_Valid   : out Boolean;
      Time_Is_Upper : out Boolean;
      Total_Is_Lower : out Boolean;
      Status        : out Status_Code);

   function Preset_Quantity (Index : Preset_Index) return Long_Float;
   function Preset_Quantity_Unit (Index : Preset_Index) return Long_Float;
   function Preset_Rate (Index : Preset_Index) return Long_Float;
   function Preset_Rate_Unit (Index : Preset_Index) return Long_Float;
   function Preset_Bound (Index : Preset_Index) return Long_Float;
   function Preset_Sets_Quantity (Index : Preset_Index) return Boolean;
   function Preset_Sets_Rate (Index : Preset_Index) return Boolean;

   --  Width of a linear rate bar, as a fraction of the bacterial figure.
   --  The bacterial figure is therefore 1, and the human figure is 1/40.
   function Linear_Share (Rate : Long_Float) return Long_Float;

   --  Width of a logarithmic rate bar, as a fraction of log(link rate).
   --  A result of 1 is the digital-link rate. These fractions are not the
   --  linear 40-to-1 ratio.
   function Logarithmic_Share (Rate : Long_Float) return Long_Float;

   procedure Reference_Seconds
     (Quantity_Bits : Long_Float;
      Rate          : Long_Float;
      Seconds       : out Long_Float;
      Valid         : out Boolean);

   --  0 custom, 1 the historical human figure, 2 the bacterial lower bound,
   --  3 the 1000BASE-T nominal line rate. A matching rate keeps its own name.
   Match_Custom    : constant Interfaces.Integer_32 := 0;
   Match_Human     : constant Interfaces.Integer_32 := 1;
   Match_Bacterial : constant Interfaces.Integer_32 := 2;
   Match_Link      : constant Interfaces.Integer_32 := 3;

   Max_Comparison_Rows : constant := 4;

   type Comparison_Row is record
      Kind         : Interfaces.Integer_32 := Match_Custom;
      Rate         : Long_Float := 0.0;
      Seconds      : Long_Float := 0.0;
      Linear       : Long_Float := 0.0;
      Logarithmic  : Long_Float := 0.0;
      Lower        : Boolean := False;
      Time_Valid   : Boolean := False;
   end record;

   type Comparison_Table is array (1 .. Max_Comparison_Rows) of Comparison_Row;

   procedure Build_Comparison
     (Rate_Bits, Bound, Quantity_Bits : Long_Float;
      Match                           : out Interfaces.Integer_32;
      Over_Human, Over_Bacterial      : out Long_Float;
      Ratio_Valid                     : out Boolean;
      Linear_Count, Log_Count         : out Interfaces.Integer_32;
      Linear_Rows, Log_Rows           : out Comparison_Table);
end Ath_Throughput;
