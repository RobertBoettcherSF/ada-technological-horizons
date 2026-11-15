with Ath_Galaxy;

package body Ath_Galaxy_Exports is
   use type Interfaces.Integer_32;

   Stored_Count : Long_Float := 0.0;
   Stored_Distance : Long_Float := 0.0;
   Stored_Known : Boolean := False;
   Stored_Share : Long_Float := 0.0;
   Stored_Saturated : Boolean := False;
   Stored_Caption : Interfaces.Integer_32 := 0;
   Stored_Systems : Long_Float := 0.0;
   Stored_Life : Ath_Galaxy.Sample_Values := (others => 0.0);
   Stored_N : Ath_Galaxy.Sample_Values := (others => 0.0);
   Stored_D : Ath_Galaxy.Sample_Values := (others => 0.0);
   Stored_X : Ath_Galaxy.Sample_Values := (others => 0.0);
   Stored_Y : Ath_Galaxy.Sample_Values := (others => 0.0);
   Stored_Pin_Life : Ath_Galaxy.Pin_Values := (others => 0.0);
   Stored_Pin_Distance : Ath_Galaxy.Pin_Values := (others => 0.0);
   Stored_Pin_Upper : Ath_Galaxy.Pin_Flags := (others => 0);
   Stored_Pin_Slider : Ath_Galaxy.Pin_Values := (others => 0.0);
   Ready : Boolean := False;

   function Ath_Galaxy_F64
     (Years : Long_Float;
      Modern : Interfaces.Integer_32) return Interfaces.Integer_32 is
      Status : Ath_Galaxy.Status_Code;
   begin
      Ath_Galaxy.Evaluate
        (Years, Modern /= 0, Stored_Count, Stored_Distance, Stored_Known,
         Stored_Share, Stored_Saturated, Stored_Caption, Stored_Systems, Status);
      if Status = Ath_Galaxy.Ok then
         Ath_Galaxy.Samples
           (Modern /= 0, Stored_Life, Stored_N, Stored_D, Stored_X, Stored_Y);
         Ath_Galaxy.Pins
           (Stored_Pin_Life, Stored_Pin_Distance, Stored_Pin_Upper, Stored_Pin_Slider);
         Ready := True;
      else
         Ready := False;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Galaxy_F64;

   function Ath_Galaxy_Count return Long_Float is
   begin
      return Stored_Count;
   end Ath_Galaxy_Count;

   function Ath_Galaxy_Distance return Long_Float is
   begin
      return Stored_Distance;
   end Ath_Galaxy_Distance;

   function Ath_Galaxy_Distance_Known return Interfaces.Integer_32 is
   begin
      if Stored_Known then
         return 1;
      end if;
      return 0;
   end Ath_Galaxy_Distance_Known;

   function Ath_Galaxy_Share return Long_Float is
   begin
      return Stored_Share;
   end Ath_Galaxy_Share;

   function Ath_Galaxy_Saturated return Interfaces.Integer_32 is
   begin
      if Stored_Saturated then
         return 1;
      end if;
      return 0;
   end Ath_Galaxy_Saturated;

   function Ath_Galaxy_Caption return Interfaces.Integer_32 is
   begin
      return Stored_Caption;
   end Ath_Galaxy_Caption;

   function Ath_Galaxy_Systems return Long_Float is
   begin
      return Stored_Systems;
   end Ath_Galaxy_Systems;

   function Ath_Galaxy_Window return Long_Float is
   begin
      return Ath_Galaxy.Window_Years;
   end Ath_Galaxy_Window;

   function Ath_Galaxy_Radius return Long_Float is
   begin
      return Ath_Galaxy.Disc_Radius_Ly;
   end Ath_Galaxy_Radius;

   function Ath_Galaxy_Ring return Long_Float is
   begin
      return Ath_Galaxy.Ring_Ly;
   end Ath_Galaxy_Ring;

   function Ath_Galaxy_Book_Years return Long_Float is
   begin
      return Ath_Galaxy.Book_Years;
   end Ath_Galaxy_Book_Years;

   function Ath_Galaxy_Slider_Of (Years : Long_Float) return Long_Float is
   begin
      return Ath_Galaxy.Slider_Of (Years);
   end Ath_Galaxy_Slider_Of;

   function Ath_Galaxy_Years_Of (Slider : Long_Float) return Long_Float is
   begin
      return Ath_Galaxy.Years_Of (Slider);
   end Ath_Galaxy_Years_Of;

   function Ath_Galaxy_Dot_Count return Interfaces.Integer_32 is
   begin
      return Ath_Galaxy.Dot_Count;
   end Ath_Galaxy_Dot_Count;

   function In_Dots (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Index >= 1 and then Index <= Ath_Galaxy.Dot_Count;
   end In_Dots;

   function Ath_Galaxy_Dot_X (Index : Interfaces.Integer_32) return Long_Float is
      X, Y : Long_Float;
   begin
      if not In_Dots (Index) then
         return 0.0;
      end if;
      Ath_Galaxy.Dot (Positive (Index), X, Y);
      return X;
   end Ath_Galaxy_Dot_X;

   function Ath_Galaxy_Dot_Y (Index : Interfaces.Integer_32) return Long_Float is
      X, Y : Long_Float;
   begin
      if not In_Dots (Index) then
         return 0.0;
      end if;
      Ath_Galaxy.Dot (Positive (Index), X, Y);
      return Y;
   end Ath_Galaxy_Dot_Y;

   function Ath_Galaxy_Dot_Brightness
     (Index : Interfaces.Integer_32;
      Years : Long_Float) return Long_Float is
   begin
      if not In_Dots (Index) then
         return 0.0;
      end if;
      return Ath_Galaxy.Dot_Brightness (Positive (Index), Years);
   end Ath_Galaxy_Dot_Brightness;

   function Ath_Galaxy_Dot_Lit
     (Index : Interfaces.Integer_32;
      Years : Long_Float) return Interfaces.Integer_32 is
   begin
      if not In_Dots (Index) then
         return 0;
      end if;
      if Ath_Galaxy.Dot_Lit (Positive (Index), Years) then
         return 1;
      end if;
      return 0;
   end Ath_Galaxy_Dot_Lit;

   function Ath_Galaxy_Sample_Count return Interfaces.Integer_32 is
   begin
      if not Ready then
         return 0;
      end if;
      return Ath_Galaxy.Sample_Count;
   end Ath_Galaxy_Sample_Count;

   function Sample_Ok (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Ready and then Index >= 1 and then Index <= Ath_Galaxy.Sample_Count;
   end Sample_Ok;

   function Ath_Galaxy_Sample_Life (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Stored_Life (Positive (Index));
   end Ath_Galaxy_Sample_Life;

   function Ath_Galaxy_Sample_Count_N (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Stored_N (Positive (Index));
   end Ath_Galaxy_Sample_Count_N;

   function Ath_Galaxy_Sample_Distance (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Stored_D (Positive (Index));
   end Ath_Galaxy_Sample_Distance;

   function Ath_Galaxy_Sample_X (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Stored_X (Positive (Index));
   end Ath_Galaxy_Sample_X;

   function Ath_Galaxy_Sample_Y (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Sample_Ok (Index) then
         return 0.0;
      end if;
      return Stored_Y (Positive (Index));
   end Ath_Galaxy_Sample_Y;

   function Ath_Galaxy_Distance_Min return Long_Float is
   begin
      return Ath_Galaxy.Distance_Axis_Min;
   end Ath_Galaxy_Distance_Min;

   function Ath_Galaxy_Distance_Max return Long_Float is
   begin
      return Ath_Galaxy.Distance_Axis_Max;
   end Ath_Galaxy_Distance_Max;

   function Ath_Galaxy_Distance_Pos (Distance : Long_Float) return Long_Float is
   begin
      return Ath_Galaxy.Distance_Pos (Distance);
   end Ath_Galaxy_Distance_Pos;

   function Ath_Galaxy_Pin_Count return Interfaces.Integer_32 is
   begin
      if not Ready then
         return 0;
      end if;
      return Ath_Galaxy.Pin_Count;
   end Ath_Galaxy_Pin_Count;

   function Pin_Ok (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Ready and then Index >= 1 and then Index <= Ath_Galaxy.Pin_Count;
   end Pin_Ok;

   function Ath_Galaxy_Pin_Life (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Pin_Ok (Index) then
         return 0.0;
      end if;
      return Stored_Pin_Life (Positive (Index));
   end Ath_Galaxy_Pin_Life;

   function Ath_Galaxy_Pin_Distance (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Pin_Ok (Index) then
         return 0.0;
      end if;
      return Stored_Pin_Distance (Positive (Index));
   end Ath_Galaxy_Pin_Distance;

   function Ath_Galaxy_Pin_Upper (Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if not Pin_Ok (Index) then
         return 0;
      end if;
      return Stored_Pin_Upper (Positive (Index));
   end Ath_Galaxy_Pin_Upper;

   function Ath_Galaxy_Pin_Slider (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Pin_Ok (Index) then
         return 0.0;
      end if;
      return Stored_Pin_Slider (Positive (Index));
   end Ath_Galaxy_Pin_Slider;

   function Ath_Galaxy_Pin_Y (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Pin_Ok (Index) then
         return 0.0;
      end if;
      return Ath_Galaxy.Distance_Pos (Stored_Pin_Distance (Positive (Index)));
   end Ath_Galaxy_Pin_Y;
end Ath_Galaxy_Exports;
